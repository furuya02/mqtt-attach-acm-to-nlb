import * as cdk from "aws-cdk-lib";

import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_elasticloadbalancingv2 as elbv2 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_ecs as ecs } from "aws-cdk-lib";
import { aws_logs as logs } from "aws-cdk-lib";
import { aws_ecr as ecr } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface EcsConstructProps extends cdk.StackProps {
  projectName: string;
  vpc: ec2.Vpc;
  taskCpu: number;
  taskMemory: number;
  ecrRepositoryName: string;
  tag: string;
  desiredCount: number;
  certificateArn: string;
}

export class EcsConstruct extends Construct {
  public readonly appServerSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: EcsConstructProps) {
    super(scope, id);

    const { projectName, vpc, taskCpu, taskMemory, ecrRepositoryName, tag, desiredCount, certificateArn } = props!;

    const securityGroupForFargate = new ec2.SecurityGroup(this, `${projectName}-SgFargate`, {
      vpc: vpc,
      allowAllOutbound: false,
    });
    securityGroupForFargate.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(1883));
    securityGroupForFargate.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTcp());

    //*********************************************** */
    // ECR
    //*********************************************** */
    const image = ecs.ContainerImage.fromEcrRepository(
      ecr.Repository.fromRepositoryName(this, `${projectName}-RepositoryName`, ecrRepositoryName),
      tag,
    );

    //*********************************************** */
    // NLB
    //*********************************************** */
    const nlbForApp = new elbv2.NetworkLoadBalancer(this, `${projectName}-Nlb`, {
      loadBalancerName: `${projectName}-nlb`,
      vpc: vpc,
      internetFacing: true,
      vpcSubnets: vpc.selectSubnets({
        subnetGroupName: "Public",
      }),
    });

    //*********************************************** */
    // ECS
    //*********************************************** */
    const executionRole = new iam.Role(this, `${projectName}-EcsTaskExecutionRole`, {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy")],
    });
    const serviceTaskRole = new iam.Role(this, `${projectName}-EcsServiceTaskRole`, {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")],
    });

    const serviceTaskDefinition = new ecs.FargateTaskDefinition(this, `${projectName}-service-task-definition`, {
      cpu: taskCpu,
      memoryLimitMiB: taskMemory,
      executionRole: executionRole,
      taskRole: serviceTaskRole,
    });
    // 自動的に作成されるタスク定義名が分かりにくいので変更する
    const taskDefinitionName = `${projectName}-task-definition`;
    (serviceTaskDefinition.node.defaultChild as ecs.CfnTaskDefinition).addPropertyOverride(
      "Family",
      taskDefinitionName,
    );

    const logGroup = new logs.LogGroup(this, `${projectName}-ServiceLogGroup`, {
      logGroupName: `/ecs/${projectName}-log`,
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    serviceTaskDefinition
      .addContainer(`${projectName}-ServiceTaskContainerDefinition`, {
        image,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: `mqtt`,
          logGroup,
        }),
        environment: {
          ACCOUNT_ID: cdk.Stack.of(this).account,
          PROJECT_NAME: projectName,
          TAG: tag,
        },
      })
      .addPortMappings({
        containerPort: 1883,
        //hostPort: 1883,
        protocol: ecs.Protocol.TCP,
      });

    const cluster = new ecs.Cluster(this, `${projectName}-Cluster`, {
      clusterName: `${projectName}-cluster`,
      vpc: vpc,
      containerInsights: true,
    });

    const fargateService = new ecs.FargateService(this, `${projectName}-FargateService`, {
      cluster,
      vpcSubnets: vpc.selectSubnets({ subnetGroupName: "Private" }),
      securityGroups: [securityGroupForFargate],
      taskDefinition: serviceTaskDefinition,
      desiredCount: desiredCount,
      maxHealthyPercent: 200,
      minHealthyPercent: 50,
      enableExecuteCommand: true,
      serviceName: `${projectName}-service`,
    });

    //*********************************************** */
    // Lisnner & TargetGtoup
    //*********************************************** */
    // TLSなしでListenする場合
    // const nlbListener = nlbForApp.addListener(`${projectName}-nlbListener`, {
    //   port: 1883,
    // });

    // TLSでListenする場合
    const nlbListener = nlbForApp.addListener(`${projectName}-nlbListener`, {
      protocol: elbv2.Protocol.TLS,
      port: 8883,
      certificates: [
        {
          certificateArn: certificateArn,
        },
      ],
    });

    nlbListener.addTargets(`${projectName}-FromAppTargetGroup`, {
      port: 1883,
      protocol: elbv2.Protocol.TCP,
      preserveClientIp: false, // クライアントIPアドレスを保持しない
      targets: [fargateService],
      healthCheck: {
        interval: cdk.Duration.seconds(120),
        // port: "1883",
      },
    });
  }
}

import * as cdk from "aws-cdk-lib";

import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface VpcConstructProps extends cdk.StackProps {
  projectName: string;
  vpcCidr: string;
  natGateways: number;
}

export class VpcConstruct extends Construct {
  public readonly myVpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: VpcConstructProps) {
    super(scope, id);

    const { projectName, vpcCidr, natGateways } = props!;
    const vpcName = `${projectName}-vpc`;

    //*********************************************** */
    // VPC
    //*********************************************** */
    const myVpc = new ec2.Vpc(this, `${projectName}-Vpc`, {
      vpcName: vpcName,
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      availabilityZones: ["ap-northeast-1a"],
      natGateways: natGateways,
      flowLogs: {},
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    //*********************************************** */
    // VPC Endpoint
    //*********************************************** */
    myVpc.addGatewayEndpoint(`${id}-S3EndpointForPrivate`, {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
    });
    myVpc.addInterfaceEndpoint(`${id}-EcrEndpointForPrivate`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });
    myVpc.addInterfaceEndpoint(`${id}-EcrDkrEndpointForPrivate`, {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });
    myVpc.addInterfaceEndpoint(`${id}-LogsEndpointForPrivate`, {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });
    // 以下は、ECS Exec用
    myVpc.addInterfaceEndpoint(`${id}-SSMMessagesEndpoinForPrivatet`, {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });
    myVpc.addInterfaceEndpoint(`${id}-SSMEndpointForPrivatet`, {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });
    this.myVpc = myVpc;
  }
}

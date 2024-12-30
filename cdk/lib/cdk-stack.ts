import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { EcrConstruct } from "./construct/ecr";
import { VpcConstruct } from "./construct/vpc";
import { EcsConstruct } from "./construct/ecs";

type CdkStackProps = cdk.StackProps & {
  projectName: string;
  tag: string;
  vpcCidr: string;
  taskCpu: number;
  taskMemory: number;
  desiredCount: number;
  natGateways: number;
  certificateArn: string;
};

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: CdkStackProps) {
    super(scope, id, props);

    const { projectName, tag, vpcCidr, taskCpu, taskMemory, desiredCount, natGateways, certificateArn } = props!;
    const repositoryName = `${projectName}-repo`;

    //*********************************************** */
    // VPC
    //*********************************************** */
    const vpcStack = new VpcConstruct(this, `${projectName}-vpc`, {
      projectName: projectName,
      vpcCidr: vpcCidr,
      natGateways: natGateways,
    });

    //*********************************************** */
    // ECR
    //*********************************************** */
    new EcrConstruct(this, `${projectName}-ecr`, {
      repositoryName: repositoryName,
    });

    //*********************************************** */
    // ECS
    //*********************************************** */
    new EcsConstruct(this, `${projectName}-ecs`, {
      projectName: projectName,
      vpc: vpcStack.myVpc,
      taskCpu: taskCpu,
      taskMemory: taskMemory,
      ecrRepositoryName: repositoryName,
      tag: tag,
      desiredCount: desiredCount,
      certificateArn: certificateArn,
    });
  }
}

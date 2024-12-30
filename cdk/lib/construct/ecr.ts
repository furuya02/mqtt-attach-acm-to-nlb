import * as cdk from "aws-cdk-lib";
import { aws_ecr as ecr } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface EcrConstructProps extends cdk.StackProps {
  repositoryName: string;
}

export class EcrConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EcrConstructProps) {
    super(scope, id);

    const { repositoryName } = props!;

    //*********************************************** */
    // ECR
    //*********************************************** */
    const repository = new ecr.Repository(this, repositoryName, {
      repositoryName: repositoryName,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE, // サンプルのため上書きを許可しています
    });
    repository.addLifecycleRule({ maxImageCount: 5 });
  }
}

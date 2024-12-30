#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
const projectName = app.node.tryGetContext("projectName");
const accountId = app.node.tryGetContext("accountId");
const vpcCidr = app.node.tryGetContext("vpcCidr");
const taskCpu = app.node.tryGetContext("taskCpu");
const taskMemory = app.node.tryGetContext("taskMemory");
const desiredCount = app.node.tryGetContext("desiredCount");
const natGateways = app.node.tryGetContext("natGateways");
const certificateArn = app.node.tryGetContext("certificateArn");

let tag = app.node.tryGetContext("tag");
if (!tag) {
  throw new Error(`tagが指定されていません`);
}
tag = tag.slice(0, 7); // 最大長を7文字に制限する
console.log(`tag: ${tag}`);

const region = "ap-northeast-1";
if (process.env["CDK_DEFAULT_ACCOUNT"] !== accountId) {
  throw new Error(`スイッチしている環境とデプロイ先の環境が不一致です`);
}

const env = { accountId, region };
new CdkStack(app, `${projectName}-stack`, {
  projectName,
  tag,
  vpcCidr,
  taskCpu,
  taskMemory,
  desiredCount,
  natGateways,
  certificateArn,
  env,
});

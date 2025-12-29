import * as cdk from "aws-cdk-lib"
import { WebStack } from "../lib/web-stack"
import { CoreStack } from "../lib/core-stack"
import { ApiStack } from "../lib/api-stack"

const app = new cdk.App()
const stage = (app.node.tryGetContext("stage") ?? "stg") as "stg" | "prod"

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
}

// Core は1回だけ
const coreStack = new CoreStack(app, `drinq-${stage}-CoreStack`, {
  stage,
  env,
})

// API は Core の table を参照
new ApiStack(app, `drinq-${stage}-ApiStack`, {
  stage,
  table: coreStack.table,
  env,
})

// Web が何か（S3/CloudFront）で Core を使うなら渡す。使わないなら渡さないでOK
new WebStack(app, `drinq-${stage}-WebStack`, {
  stage,
  env,
})

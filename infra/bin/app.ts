import * as cdk from "aws-cdk-lib"
import { CoreStack } from "../lib/core-stack"
import { WebStack } from "../lib/web-stack"

const app = new cdk.App()

const stage = app.node.tryGetContext("stage") ?? "stg"
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
}

const core = new CoreStack(app, `drinq-${stage}-core`, { env, stage })
new WebStack(app, `drinq-${stage}-web`, {
  env,
  stage,
  table: core.table, // ← coreのリソースを参照
})

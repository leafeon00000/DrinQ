import * as cdk from "aws-cdk-lib"
import { WebStack } from "../lib/web-stack"

const app = new cdk.App()
const stage = (app.node.tryGetContext("stage") ?? "stg") as "stg" | "prod"

new WebStack(app, `drinq-${stage}-WebStack`, {
  stage,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})

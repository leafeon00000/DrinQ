import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as amplify from "aws-cdk-lib/aws-amplify"
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

type Props = cdk.StackProps & {
  stage: string
  table: dynamodb.ITable
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const githubTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "GitHubToken",
      "drinq/github_token"
    )

    const githubToken = githubTokenSecret.secretValueFromJson(
      "drinq/github-token"
    ).toString()

    // Amplify App (Next.js SSR)
    const app = new amplify.CfnApp(this, "AmplifyApp", {
      name: `drinq-${props.stage}-web`,
      repository: "https://github.com/leafeon00000/DrinQ",
      accessToken: githubToken,
      platform: "WEB_COMPUTE", // SSR対応
      environmentVariables: [
        { name: "STAGE", value: props.stage },
        { name: "DDB_TABLE_NAME", value: props.table.tableName },
      ],
      // monorepoなので web 配下をビルド
      buildSpec: `
version: 1
applications:
  - appRoot: web
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      cache:
        paths:
          - node_modules/**/*
`,
    })

    new amplify.CfnBranch(this, "Branch", {
      appId: app.attrAppId,
      branchName: props.stage, // stg / prod みたいにできる
      enableAutoBuild: true,
    })

    new cdk.CfnOutput(this, "AmplifyDefaultDomain", {
      value: app.attrDefaultDomain,
    })
  }
}

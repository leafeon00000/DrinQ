// file: infra/lib/api-stack.ts
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as apigw from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as path from "path"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

type Props = cdk.StackProps & {
  stage: string
  table: dynamodb.Table
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigw.RestApi

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const apiFn = new nodejs.NodejsFunction(this, "DrinqApiFn", {
      entry: path.join(__dirname, "../../services/api/src/handler.ts"),
      handler: "handler",
      functionName: `drinq-${props.stage}-api`,
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: props.table.tableName },
    })

    props.table.grantReadWriteData(apiFn)

    this.api = new apigw.RestApi(this, "DrinqApi", {
      restApiName: `drinq-${props.stage}-api`,
      deployOptions: { stageName: props.stage },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    })

    const integration = new apigw.LambdaIntegration(apiFn)

    this.api.root.addResource("beverages").addMethod("GET", integration)

    const shops = this.api.root.addResource("shops")
    const shop = shops.addResource("{shopId}")

    // /shops/{shopId}/beverages
    const shopBevs = shop.addResource("beverages")
    shopBevs.addMethod("GET", integration)
    shopBevs.addMethod("POST", integration)

    // /shops/{shopId}/beverages/{beverageId}
    const shopBev = shopBevs.addResource("{beverageId}")
    shopBev.addMethod("PUT", integration)
    shopBev.addMethod("DELETE", integration)

    new cdk.CfnOutput(this, "ApiBaseUrl", { value: this.api.url })
  }
}

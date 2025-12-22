import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

type Props = cdk.StackProps & { stage: string }

export class CoreStack extends cdk.Stack {
  public readonly table: dynamodb.Table

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    this.table = new dynamodb.Table(this, "DrinqTable", {
      tableName: `drinq-${props.stage}-main`,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    })
  }
}

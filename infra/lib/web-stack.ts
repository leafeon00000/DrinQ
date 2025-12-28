import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import * as origins from "aws-cdk-lib/aws-cloudfront-origins"
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"
import * as iam from "aws-cdk-lib/aws-iam"

export interface WebStackProps extends cdk.StackProps {
  stage: "stg" | "prod"
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props)

    const { stage } = props

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: `${cdk.Stack.of(this).account}-drinq-web-${stage}-${cdk.Stack.of(this).region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage === "prod" ? false : true,
    })

    new cloudfront.S3OriginAccessControl(this, "OAC", {
      originAccessControlName: `drinq-web-oac-${stage}`,
    })

    // Distribution は普通に作る（Origin は S3Origin でOK）
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: "/index.html" },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: "/index.html" },
      ],
    })

    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    )

    // ビルド成果物をS3にアップロード（web/out を前提）
    new s3deploy.BucketDeployment(this, "DeployWeb", {
      sources: [s3deploy.Source.asset("../web/out")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    })

    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: `https://${distribution.domainName}`,
    })
  }
}

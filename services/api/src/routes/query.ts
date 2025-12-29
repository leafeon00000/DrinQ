// file: services/api/src/routes/query.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import type { Category, GlobalBeverage, ShopBeverage } from "../domain/types"

const TABLE_NAME = process.env.TABLE_NAME!
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

// GET /beverages?category=sake
export async function queryGrobalBeverages(
  category?: Category
): Promise<GlobalBeverage[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "gsi1",
      KeyConditionExpression:
        "gsi1pk = :pk" + (category ? " AND begins_with(gsi1sk, :pfx)" : ""),
      ExpressionAttributeValues: {
        ":pk": "BEV",
        ...(category ? { ":pfx": `${category}#` } : {}),
      },
      Limit: 50,
      ScanIndexForward: false,
    })
  )
  return (res.Items ?? []) as GlobalBeverage[]
}

// GET /shops/{shopId}/beverages
export async function queryShopBeverages(
  shopId: string
): Promise<ShopBeverage[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :bev)",
      ExpressionAttributeValues: {
        ":pk": `SHOP#${shopId}`,
        ":bev": "BEV#",
      },
    })
  )
  return (res.Items ?? []) as ShopBeverage[]
}

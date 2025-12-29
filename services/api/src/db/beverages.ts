// file: services/api/src/db/beverages.ts
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { ddb, TABLE_NAME } from "./client"
import type { Category, CreateOrAttachBody, GlobalBeverage, ShopBeverage } from "../domain/types"
import { UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb"

export function toBevPk(beverageId: string) {
  return `BEV#${beverageId}`
}

export async function createGlobalBeverage(params: {
  beverageId: string
  category: Category
  name: string
  brewery?: string
  region?: string
  aroma?: string
  memo?: string
  flavor?: Record<string, number>
  createdAt: string
}): Promise<GlobalBeverage> {
  const item: GlobalBeverage = {
    pk: toBevPk(params.beverageId),
    sk: "META",
    entityType: "BEV",
    beverageId: params.beverageId,
    category: params.category,
    name: params.name,
    brewery: params.brewery ?? "",
    region: params.region ?? "",
    aroma: params.aroma ?? "",
    memo: params.memo ?? "",
    flavor: params.flavor ?? {},
    createdAt: params.createdAt,
    gsi1pk: "BEV",
    gsi1sk: `${params.category}#${params.createdAt}#${params.beverageId}`,
  }

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      // 同じIDでの上書き防止
      ConditionExpression: "attribute_not_exists(pk)",
    })
  )

  return item
}

export async function upsertShopBeverage(params: {
  shopId: string
  beverageId: string
  body: CreateOrAttachBody
  createdAt: string
}): Promise<ShopBeverage> {
  const item: ShopBeverage = {
    pk: `SHOP#${params.shopId}`,
    sk: toBevPk(params.beverageId),
    entityType: "SHOP_BEV",
    shopId: params.shopId,
    beverageId: params.beverageId,
    price: params.body.price ?? null,
    isActive: params.body.isActive ?? true,
    shopMemo: params.body.shopMemo ?? "",
    createdAt: params.createdAt,
  }

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  )

  return item
}

export async function updateShopBeverage(params: {
  shopId: string
  beverageId: string
  price?: number
  isActive?: boolean
  shopMemo?: string
}) {
  const updates: string[] = []
  const values: Record<string, any> = {}
  const names: Record<string, string> = {}

  if (params.price !== undefined) {
    updates.push("#price = :price")
    names["#price"] = "price"
    values[":price"] = params.price
  }
  if (params.isActive !== undefined) {
    updates.push("#isActive = :isActive")
    names["#isActive"] = "isActive"
    values[":isActive"] = params.isActive
  }
  if (params.shopMemo !== undefined) {
    updates.push("#shopMemo = :shopMemo")
    names["#shopMemo"] = "shopMemo"
    values[":shopMemo"] = params.shopMemo
  }

  if (updates.length === 0) return

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `SHOP#${params.shopId}`,
        sk: `BEV#${params.beverageId}`,
      },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  )
}

export async function deleteShopBeverage(shopId: string, beverageId: string) {
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `SHOP#${shopId}`,
        sk: `BEV#${beverageId}`,
      },
    })
  )
}

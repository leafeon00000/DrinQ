// file: services/api/src/handler.ts
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { json } from "./utils/http"
import type { Category, CreateOrAttachBody } from "./domain/types"
import { queryGrobalBeverages, queryShopBeverages } from "./routes/query"
import { postShopBeverage } from "./routes/postShopBeverage"
import { putShopBeverage, removeShopBeverage } from "./routes/shopBeverageActions"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const method = event.httpMethod
    const rawPath = event.path

    // GET /beverages?category=sake
    if (method === "GET" && rawPath === "/beverages") {
      const category = (event.queryStringParameters?.category as Category | undefined) ?? undefined
      const items = await queryGrobalBeverages(category)
      return json(200, { items })
    }

    // /shops/{shopId}/beverages
    const m = rawPath.match(/^\/shops\/([^/]+)\/beverages\/?$/)
    if (m) {
      const shopId = decodeURIComponent(m[1])

      if (method === "GET") {
        const items = await queryShopBeverages(shopId)
        return json(200, { items })
      }

      if (method === "POST") {
        const body: CreateOrAttachBody = event.body ? JSON.parse(event.body) : {}
        const result = await postShopBeverage(shopId, body)

        if (!result.ok) {
          return json(result.error.status, { message: result.error.message })
        }

        return json(200, { beverageId: result.beverageId })
      }
    }

    // /shops/{shopId}/beverages/{beverageId}
    const m2 = rawPath.match(/^\/shops\/([^/]+)\/beverages\/([^/]+)$/)
    if (m2) {
      const shopId = decodeURIComponent(m2[1])
      const beverageId = decodeURIComponent(m2[2])

      if (method === "PUT") {
        const body = event.body ? JSON.parse(event.body) : {}
        await putShopBeverage(shopId, beverageId, body)
        return json(204, null)
      }

      if (method === "DELETE") {
        await removeShopBeverage(shopId, beverageId)
        return json(204, null)
      }
    }

    return json(404, { message: "Not Found" })
  } catch (e) {
    console.error(e)
    return json(500, { message: "Internal Server Error" })
  }
}

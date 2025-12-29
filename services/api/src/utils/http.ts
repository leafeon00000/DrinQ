// file: services/api/src/utils/http.ts
import type { APIGatewayProxyResult } from "aws-lambda"

export function json(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  }
}

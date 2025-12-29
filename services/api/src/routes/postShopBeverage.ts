// file: services/api/src/routes/postShopBeverage.ts
import type { CreateOrAttachBody } from "../domain/types"
import { uuidv7 } from "../utils/uuidv7"
import { createGlobalBeverage, upsertShopBeverage } from "../db/beverages"

type PostShopBeverageResult =
  | { ok: true; beverageId: string }
  | { ok: false; error: { status: number; message: string } }

export async function postShopBeverage(
  shopId: string,
  body: CreateOrAttachBody
): Promise<PostShopBeverageResult> {
  const now = new Date().toISOString()

  if (body.beverageId) {
    await upsertShopBeverage({ shopId, beverageId: body.beverageId, body, createdAt: now })
    return { ok: true, beverageId: body.beverageId }
  }

  if (!body.category || !body.name) {
    return {
      ok: false,
      error: { status: 400, message: "category and name are required for new beverage" },
    }
  }

  const beverageId = uuidv7()

  await createGlobalBeverage({
    beverageId,
    category: body.category,
    name: body.name,
    brewery: body.brewery,
    region: body.region,
    aroma: body.aroma,
    memo: body.memo,
    flavor: body.flavor,
    createdAt: now,
  })

  await upsertShopBeverage({ shopId, beverageId, body, createdAt: now })

  return { ok: true, beverageId }
}

// file: services/api/src/routes/shopBeverageActions.ts
import { updateShopBeverage, deleteShopBeverage } from "../db/beverages"

export async function putShopBeverage(
  shopId: string,
  beverageId: string,
  body: { price?: number; isActive?: boolean; shopMemo?: string }
) {
  await updateShopBeverage({ shopId, beverageId, ...body })
}

export async function removeShopBeverage(shopId: string, beverageId: string) {
  await deleteShopBeverage(shopId, beverageId)
}

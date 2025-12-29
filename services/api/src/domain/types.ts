// file: services/api/src/domain/types.ts
export type Category = "sake" | "wine" | "shochu" | "other"

export type GlobalBeverage = {
  pk: string
  sk: "META"
  entityType: "BEV"
  beverageId: string
  category: Category
  name: string
  brewery?: string
  region?: string
  aroma?: string
  memo?: string
  flavor?: Record<string, number>
  createdAt: string
  gsi1pk: "BEV"
  gsi1sk: string
}

export type ShopBeverage = {
  pk: string
  sk: string // "BEV#..."
  entityType: "SHOP_BEV"
  shopId: string
  beverageId: string
  price?: number | null
  isActive: boolean
  shopMemo?: string
  createdAt: string
}

export type CreateOrAttachBody = {
  beverageId?: string

  // 新規作成に必要
  category?: Category
  name?: string
  brewery?: string
  region?: string
  aroma?: string
  memo?: string
  flavor?: Record<string, number>

  // 店差分
  price?: number
  isActive?: boolean
  shopMemo?: string
}
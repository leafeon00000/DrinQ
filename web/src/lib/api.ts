export const getShopItems = async (shopId: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/${shopId}/items`)
  return res.json()
}

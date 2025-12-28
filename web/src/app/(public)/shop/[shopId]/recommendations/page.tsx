import { Suspense } from "react"
import RecommendationsClient from "./RecommendationsClient"

export function generateStaticParams() {
  return [{ shopId: "demo" }]
}

export default function RecommendationsPage({ params }: { params: { shopId: string } }) {
  return (
    <Suspense fallback={<div className="p-4 text-zinc-400">読み込み中...</div>}>
      <RecommendationsClient shopId={params.shopId} />
    </Suspense>
  )
}

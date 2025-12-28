// file: web/src/app/(public)/shop/[shopId]/questions/page.tsx
import QuestionsClient from "./QuestionsClient"

export function generateStaticParams() {
  return [{ shopId: "demo" }]
}

export default function QuestionsPage({ params }: { params: { shopId: string } }) {
  return <QuestionsClient shopId={params.shopId} />
}

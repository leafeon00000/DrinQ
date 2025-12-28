import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function generateStaticParams() {
  return [{ shopId: "demo" }]
}

export default function ShopPage({ params }: { params: { shopId: string } }) {
  const { shopId } = params

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-50">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/70 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">DrinQ</CardTitle>
          <p className="mt-1 text-sm text-zinc-400">
            店舗ID: <span className="font-mono">{shopId}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-zinc-300">
            いくつかの質問に答えるとあなたにぴったりなお酒をおすすめします。
          </p>
          <div className="flex justify-end">
            <Button size="lg" className="px-8">
              質問をはじめる
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

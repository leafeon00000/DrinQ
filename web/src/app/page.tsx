import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-50">
      <h1 className="text-3xl font-bold">DrinQ</h1>
      <p className="text-zinc-400">あなたの好みに合う一杯を。</p>

      <div className="flex gap-4">
        <Link href="/admin" className="underline">
          酒屋向け管理画面
        </Link>
        <Link href="/shop/demo/questions" className="underline">
          おすすめ診断を試す
        </Link>
      </div>
    </main>
  )
}

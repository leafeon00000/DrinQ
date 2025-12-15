// file: src/app/shop/[shopId]/recommendations/page.tsx
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type AlcoholType = "sake" | "wine"
type Answers = Record<string, string>

type SakeFlavorProfile = {
  floral: number
  rich: number
  heavy: number
  calm: number
  dry: number
  light: number
}

type WineFlavorProfile = {
  body: number
  sweetness: number
  acidity: number
  tannin: number
  aroma: number
  fruit: number
}

type Beverage = {
  id: string
  name: string
  category: AlcoholType
  maker?: string
  region?: string
  note?: string
  sakeFlavor?: SakeFlavorProfile
  wineFlavor?: WineFlavorProfile
}

// 仮データ（あとでDynamoDBに置き換える）
const mockBeverages: Beverage[] = [
  {
    id: "s1",
    category: "sake",
    name: "而今 純米吟醸",
    maker: "木屋正酒造",
    region: "三重",
    note: "華やか寄り、バランス良い",
    sakeFlavor: { floral: 5, rich: 4, heavy: 3, calm: 2, dry: 3, light: 3 },
  },
  {
    id: "s2",
    category: "sake",
    name: "田酒 特別純米",
    maker: "西田酒造店",
    region: "青森",
    note: "旨みしっかり、落ち着き",
    sakeFlavor: { floral: 2, rich: 4, heavy: 4, calm: 4, dry: 3, light: 2 },
  },
  {
    id: "s3",
    category: "sake",
    name: "風の森 ALPHA",
    maker: "油長酒造",
    region: "奈良",
    note: "軽快で爽やか",
    sakeFlavor: { floral: 3, rich: 3, heavy: 2, calm: 2, dry: 4, light: 5 },
  },
  {
    id: "w1",
    category: "wine",
    name: "ピノ・ノワール（仮）",
    maker: "Domaine Sample",
    region: "ブルゴーニュ",
    note: "繊細、果実味",
    wineFlavor: { body: 2, sweetness: 2, acidity: 4, tannin: 2, aroma: 4, fruit: 4 },
  },
  {
    id: "w2",
    category: "wine",
    name: "カベルネ（仮）",
    maker: "Chateau Sample",
    region: "ボルドー",
    note: "フルボディ、渋み",
    wineFlavor: { body: 5, sweetness: 1, acidity: 3, tannin: 5, aroma: 3, fruit: 3 },
  },
]

function clamp1to5(n: number) {
  return Math.max(1, Math.min(5, n))
}

// 回答 → “理想プロファイル” を作る（いまは単純ルール）
function buildTarget(type: AlcoholType, answers: Answers) {
  if (type === "sake") {
    const target: SakeFlavorProfile = { floral: 3, rich: 3, heavy: 3, calm: 3, dry: 3, light: 3 }

    switch (answers["sake_aroma"]) {
      case "floral_high":
        target.floral = 5
        target.calm = 2
        break
      case "calm_high":
        target.calm = 5
        target.floral = 2
        break
    }

    switch (answers["sake_richness"]) {
      case "light":
        target.light = 5
        target.heavy = 2
        break
      case "medium":
        target.rich = 4
        break
      case "rich":
        target.rich = 5
        target.heavy = 5
        target.light = 2
        break
    }

    switch (answers["sake_sweetness"]) {
      case "dry":
        target.dry = 5
        break
      case "sweet":
        target.dry = 2
        break
    }

    // 念のため範囲補正
    ;(Object.keys(target) as (keyof SakeFlavorProfile)[]).forEach((k) => {
      target[k] = clamp1to5(target[k])
    })

    return target
  }

  // wine
  const target: WineFlavorProfile = {
    body: 3,
    sweetness: 3,
    acidity: 3,
    tannin: 3,
    aroma: 3,
    fruit: 3,
  }

  // 例：wine_body / wine_tannin は質問で取ってたので反映
  switch (answers["wine_body"]) {
    case "light":
      target.body = 2
      break
    case "medium":
      target.body = 3
      break
    case "full":
      target.body = 5
      break
  }

  switch (answers["wine_tannin"]) {
    case "low":
      target.tannin = 2
      break
    case "medium":
      target.tannin = 3
      break
    case "high":
      target.tannin = 5
      break
  }

  // 色は今はスコアに入れない（赤/白/泡フィルタにするのが自然）
  return target
}

// target と item の距離（小さいほど良い）→ スコアに変換
function scoreSake(target: SakeFlavorProfile, item: SakeFlavorProfile) {
  const keys: (keyof SakeFlavorProfile)[] = ["floral", "rich", "heavy", "calm", "dry", "light"]
  const distance = keys.reduce((sum, k) => sum + Math.abs(target[k] - item[k]), 0)
  return 100 - distance * 6 // ざっくり
}

// file: src/app/shop/[shopId]/recommendations/page.tsx
const sakeAxisLabel: Record<keyof SakeFlavorProfile, string> = {
  floral: "華やか",
  rich: "芳醇",
  heavy: "重厚",
  calm: "穏やか",
  dry: "ドライ",
  light: "軽快",
}

const wineAxisLabel: Record<keyof WineFlavorProfile, string> = {
  body: "ボディ",
  sweetness: "甘辛",
  acidity: "酸味",
  tannin: "渋み",
  aroma: "香り",
  fruit: "果実味",
}

function buildReasonsForSake(target: SakeFlavorProfile, item: SakeFlavorProfile, max = 3) {
  const keys: (keyof SakeFlavorProfile)[] = ["floral", "rich", "heavy", "calm", "dry", "light"]

  // 差分が小さいほど「合ってる」→理由にする
  const ranked = keys
    .map((k) => {
      const diff = Math.abs(target[k] - item[k])
      return { key: k, diff, label: sakeAxisLabel[k], t: target[k], v: item[k] }
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, max)

  return ranked.map((r) => `「${r.label}」の好みに近い（あなた:${r.t} / これ:${r.v}）`)
}

function buildReasonsForWine(target: WineFlavorProfile, item: WineFlavorProfile, max = 3) {
  const keys: (keyof WineFlavorProfile)[] = [
    "body",
    "sweetness",
    "acidity",
    "tannin",
    "aroma",
    "fruit",
  ]

  const ranked = keys
    .map((k) => {
      const diff = Math.abs(target[k] - item[k])
      return { key: k, diff, label: wineAxisLabel[k], t: target[k], v: item[k] }
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, max)

  return ranked.map((r) => `「${r.label}」の好みに近い（あなた:${r.t} / これ:${r.v}）`)
}

function scoreWine(target: WineFlavorProfile, item: WineFlavorProfile) {
  const keys: (keyof WineFlavorProfile)[] = [
    "body",
    "sweetness",
    "acidity",
    "tannin",
    "aroma",
    "fruit",
  ]
  const distance = keys.reduce((sum, k) => sum + Math.abs(target[k] - item[k]), 0)
  return 100 - distance * 5
}

export default async function RecommendationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopId: string }>
  searchParams: Promise<{ type?: string; answers?: string }>
}) {
  const { shopId } = await params
  const sp = await searchParams

  const type = (sp.type as AlcoholType) || "sake"
  const answersJson = sp.answers ? decodeURIComponent(sp.answers) : "{}"

  let answers: Answers = {}
  try {
    answers = JSON.parse(answersJson)
  } catch {
    answers = {}
  }

  const target = buildTarget(type, answers)
  const items = mockBeverages.filter((b) => b.category === type)

  const ranked = items
    .map((b) => {
      const score =
        type === "sake"
          ? scoreSake(target as SakeFlavorProfile, b.sakeFlavor!)
          : scoreWine(target as WineFlavorProfile, b.wineFlavor!)

      const reasons =
        type === "sake"
          ? buildReasonsForSake(target as SakeFlavorProfile, b.sakeFlavor!)
          : buildReasonsForWine(target as WineFlavorProfile, b.wineFlavor!)

      return { b, score, reasons }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-100">おすすめ</h1>
          <p className="text-sm text-zinc-400">
            shop: {shopId} / type: {type}
          </p>
        </div>

        <div className="grid gap-4">
          {ranked.map(({ b, score, reasons }) => (
            <Card key={b.id} className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-zinc-100">
                  <span>{b.name}</span>
                  <span className="text-xs text-amber-400">score {Math.round(score)}</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {b.maker ? `${b.maker} / ` : ""}
                  {b.region ?? ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-300">{b.note ?? "—"}</p>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-xs font-medium text-zinc-200">おすすめの理由</p>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                    {reasons.map((r: string, i: number) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href={`/shop/${shopId}/questions`}
            className="text-sm text-zinc-300 underline underline-offset-4 hover:text-zinc-100"
          >
            もう一回診断する
          </Link>
        </div>
      </div>
    </div>
  )
}

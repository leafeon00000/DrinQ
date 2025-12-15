"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

type AlcoholType = "sake" | "wine"

type QuestionOption = {
  value: string
  label: string
}

type Question = {
  id: string
  title: string
  description?: string
  options: QuestionOption[]
}

// 将来的にはここを「DB から取得した質問」に差し替える想定
const sakeQuestions: Question[] = [
  {
    id: "sake_aroma",
    title: "日本酒の香りはどっちが好き？",
    description: "華やかでフルーティー or 穏やかで落ち着いた香り",
    options: [
      { value: "floral_high", label: "華やか・フルーティー" },
      { value: "calm_high", label: "穏やか・しっとり" },
      { value: "middle", label: "どちらでも大丈夫" },
    ],
  },
  {
    id: "sake_richness",
    title: "味わいの濃さは？",
    description: "軽快〜重厚まで、今日の気分で選んでください",
    options: [
      { value: "light", label: "軽快でスッキリ" },
      { value: "medium", label: "ちょうどよいコク" },
      { value: "rich", label: "芳醇・重厚" },
    ],
  },
  {
    id: "sake_sweetness",
    title: "甘さ・キレの好みは？",
    options: [
      { value: "sweet", label: "やや甘めが好き" },
      { value: "dry", label: "キレのある辛口が好き" },
      { value: "any", label: "どちらでもOK" },
    ],
  },
]

const wineQuestions: Question[] = [
  {
    id: "wine_color",
    title: "どんなワインが飲みたい？",
    options: [
      { value: "red", label: "赤ワイン" },
      { value: "white", label: "白ワイン" },
      { value: "sparkling", label: "スパークリング" },
      { value: "any", label: "なんでもおまかせ" },
    ],
  },
  {
    id: "wine_body",
    title: "ボディ（重さ）の好みは？",
    options: [
      { value: "light", label: "軽やかでスイスイ飲める" },
      { value: "medium", label: "ちょうどよい重さ" },
      { value: "full", label: "しっかり重め" },
    ],
  },
  {
    id: "wine_tannin",
    title: "渋み（タンニン）は？",
    options: [
      { value: "low", label: "渋み控えめが好き" },
      { value: "medium", label: "ほどよい渋み" },
      { value: "high", label: "しっかり渋みも楽しみたい" },
    ],
  },
]

const questionFlows: Record<AlcoholType, Question[]> = {
  sake: sakeQuestions,
  wine: wineQuestions,
}

export default function QuestionsPage() {
  const { shopId } = useParams<{ shopId: string }>()

  const router = useRouter()
  const [alcoholType, setAlcoholType] = useState<AlcoholType | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleSelectAlcoholType = (type: AlcoholType) => {
    setAlcoholType(type)
    setStep(0)
    setAnswers({})
  }

  const currentQuestions = alcoholType ? questionFlows[alcoholType] : null
  const currentQuestion = currentQuestions ? currentQuestions[step] : null

  const handleAnswer = (value: string) => {
    if (!alcoholType) return

    const currentQuestions = questionFlows[alcoholType]
    const currentQuestion = currentQuestions[step]

    if (!currentQuestion) return

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    }
    setAnswers(nextAnswers)

    const isLast = step >= currentQuestions.length - 1
    if (isLast) {
      const params = new URLSearchParams()
      params.set("type", alcoholType)
      params.set("answers", encodeURIComponent(JSON.stringify(nextAnswers)))

      router.push(`/shop/${shopId}/recommendations?${params.toString()}`)
    } else {
      setStep((s) => s + 1)
    }
  }

  // まだ「何飲みたいか」を選んでいない状態
  if (!alcoholType || !currentQuestions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
        <Card className="w-full max-w-xl border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-xl">今日はどんなお酒を飲みたい？</CardTitle>
            <CardDescription className="text-zinc-400">
              気分に合わせてカテゴリを選んでください。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectAlcoholType("sake")}
            >
              🍶 日本酒
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectAlcoholType("wine")}
            >
              🍷 ワイン
            </Button>
            {/* 将来的に焼酎フローを追加してもOK */}
            {/* <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectAlcoholType("shochu" as AlcoholType)}
            >
              🥃 焼酎
            </Button> */}
          </CardContent>
        </Card>
      </div>
    )
  }

  // 質問フロー中
  if (!currentQuestion) {
    return null
  }

  const totalSteps = currentQuestions!.length
  const stepLabel = `質問 ${step + 1} / ${totalSteps}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
      <Card className="w-full max-w-xl border-zinc-800 bg-zinc-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
            <span className="text-xs text-zinc-400">{stepLabel}</span>
          </div>
          {currentQuestion.description && (
            <CardDescription className="text-zinc-400">
              {currentQuestion.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map((o) => (
              <Button
                key={o.value}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleAnswer(o.value)}
              >
                {o.label}
              </Button>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                // カテゴリ選び直し
                setAlcoholType(null)
                setStep(0)
                setAnswers({})
              }}
            >
              ← カテゴリから選び直す
            </Button>

            {step > 0 && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setStep((s) => (s > 0 ? s - 1 : s))}
              >
                ひとつ前に戻る
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

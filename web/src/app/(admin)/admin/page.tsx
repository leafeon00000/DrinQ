// file: src/app/(admin)/admin/page.tsx
"use client"

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type BeverageCategory = "sake" | "wine" | "shochu" | "other"

type SakeFlavorProfile = {
  floral: number // 華やか
  rich: number   // 芳醇
  heavy: number  // 重厚
  calm: number   // 穏やか
  dry: number    // ドライ
  light: number  // 軽快
}

export type WineFlavorProfile = {
  body: number        // 軽やか ←→ 重厚
  sweetness: number   // 甘口 ←→ 辛口
  acidity: number     // 酸味
  tannin: number      // 渋み
  aroma: number       // 香りの強さ
  fruit: number       // 果実味
}

type BeverageForm = {
  name: string
  category: BeverageCategory
  brewery: string
  region: string
  aroma: string
  memo: string
  sakeFlavor: SakeFlavorProfile // 日本酒
  wineFlavor: WineFlavorProfile // ワイン
}

const initialForm: BeverageForm = {
  name: "",
  category: "sake",
  brewery: "",
  region: "",
  aroma: "",
  memo: "",
  sakeFlavor: {
    floral: 3,
    rich: 3,
    heavy: 3,
    calm: 3,
    dry: 3,
    light: 3,
  },
  wineFlavor: {
    body: 3,
    sweetness: 3,
    acidity: 3,
    tannin: 3,
    aroma: 3,
    fruit: 3,
  },
}

export default function AdminPage() {
  const [form, setForm] = useState<BeverageForm>(initialForm)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleBasicChange =
    (field: keyof Omit<BeverageForm, "sakeFlavor" | "wineFlavor">) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleCategoryChange = (value: BeverageCategory) => {
    setForm((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleSakeFlavorChange =
    (field: keyof SakeFlavorProfile) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value)
      setForm((prev) => ({
        ...prev,
        sakeFlavor: {
          ...prev.sakeFlavor,
          [field]: value,
        },
      }))
    }

  const handleWineFlavorChange =
    (field: keyof WineFlavorProfile) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value)
      setForm((prev) => ({
        ...prev,
        wineFlavor: {
          ...prev.wineFlavor,
          [field]: value,
        },
      }))
    }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // TODO: ここを実際の API 呼び出し（Lambda / API Gateway）に差し替え
    startTransition(async () => {
      try {
        console.log("登録データ:", form)
        await new Promise((r) => setTimeout(r, 500))

        setMessage("登録しました 🎉")
        setForm(initialForm)
      } catch (err) {
        console.error(err)
        setMessage("登録に失敗しました 🥲")
      }
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">ドリンク登録</CardTitle>
          <CardDescription className="text-zinc-400">
            日本酒・ワイン・焼酎などのボトル情報を登録します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 基本情報 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">商品名</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={handleBasicChange("name")}
                  placeholder="而今 純米吟醸 〇〇 / Bourgogne Rouge など"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => handleCategoryChange(v as BeverageCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sake">日本酒</SelectItem>
                    <SelectItem value="wine">ワイン</SelectItem>
                    <SelectItem value="shochu">焼酎</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brewery">蔵・生産者</Label>
                <Input
                  id="brewery"
                  value={form.brewery}
                  onChange={handleBasicChange("brewery")}
                  placeholder="阿部酒造 / Domaine 〇〇"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">産地</Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={handleBasicChange("region")}
                  placeholder="新潟 / ブルゴーニュ など"
                />
              </div>
            </div>

            {/* 日本酒専用：味わい 6 パラメータ */}
            {form.category === "sake" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-300">日本酒の味わい（1〜5）</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="floral">華やか</Label>
                    <Input
                      id="floral"
                      type="range"
                      min={1}
                      max={5}
                      value={form.sakeFlavor.floral}
                      onChange={handleSakeFlavorChange("floral")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.sakeFlavor.floral}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rich">芳醇</Label>
                    <Input
                      id="rich"
                      type="range"
                      min={1}
                      max={5}
                      value={form.sakeFlavor.rich}
                      onChange={handleSakeFlavorChange("rich")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.sakeFlavor.rich}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heavy">重厚</Label>
                    <Input
                      id="heavy"
                      type="range"
                      min={1}
                      max={5}
                      value={form.sakeFlavor.heavy}
                      onChange={handleSakeFlavorChange("heavy")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.sakeFlavor.heavy}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calm">穏やか</Label>
                    <Input
                      id="calm"
                      type="range"
                      min={1}
                      max={5}
                      value={form.sakeFlavor.calm}
                      onChange={handleSakeFlavorChange("calm")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.sakeFlavor.calm}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dry">ドライ</Label>
                    <Input
                      id="dry"
                      type="range"
                      min={1}
                      max={5}
                      value={form.sakeFlavor.dry}
                      onChange={handleSakeFlavorChange("dry")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.sakeFlavor.dry}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="light">軽快</Label>
                    <Input
                      id="light"
                      type="range"
                      min={1}
                      max={5}
                      value={form.sakeFlavor.light}
                      onChange={handleSakeFlavorChange("light")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.sakeFlavor.light}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ワイン専用：味わい 6 パラメータ */}
            {form.category === "wine" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-300">ワインの味わい（1〜5）</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="body">ボディ（軽やか〜重厚）</Label>
                    <Input
                      id="body"
                      type="range"
                      min={1}
                      max={5}
                      value={form.wineFlavor.body}
                      onChange={handleWineFlavorChange("body")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.wineFlavor.body}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sweetness">甘さ（甘口〜辛口）</Label>
                    <Input
                      id="sweetness"
                      type="range"
                      min={1}
                      max={5}
                      value={form.wineFlavor.sweetness}
                      onChange={handleWineFlavorChange("sweetness")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.wineFlavor.sweetness}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acidity">酸味</Label>
                    <Input
                      id="acidity"
                      type="range"
                      min={1}
                      max={5}
                      value={form.wineFlavor.acidity}
                      onChange={handleWineFlavorChange("acidity")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.wineFlavor.acidity}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tannin">渋み（タンニン）</Label>
                    <Input
                      id="tannin"
                      type="range"
                      min={1}
                      max={5}
                      value={form.wineFlavor.tannin}
                      onChange={handleWineFlavorChange("tannin")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.wineFlavor.tannin}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aroma-wine">香りの強さ</Label>
                    <Input
                      id="aroma-wine"
                      type="range"
                      min={1}
                      max={5}
                      value={form.wineFlavor.aroma}
                      onChange={handleWineFlavorChange("aroma")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.wineFlavor.aroma}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fruit">果実味</Label>
                    <Input
                      id="fruit"
                      type="range"
                      min={1}
                      max={5}
                      value={form.wineFlavor.fruit}
                      onChange={handleWineFlavorChange("fruit")}
                    />
                    <p className="text-xs text-zinc-400">
                      現在: {form.wineFlavor.fruit}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* その他のメモ */}
            <div className="space-y-2">
              <Label htmlFor="aroma">香りの印象</Label>
              <Input
                id="aroma"
                value={form.aroma}
                onChange={handleBasicChange("aroma")}
                placeholder="フルーティー、ハーブ、ミネラル感 など"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">メモ（スタッフ用）</Label>
              <Textarea
                id="memo"
                value={form.memo}
                onChange={handleBasicChange("memo")}
                placeholder="提供温度のおすすめ、合う料理、注意点など"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-2 gap-4">
              {message && (
                <p className="text-sm text-zinc-300">
                  {message}
                </p>
              )}
              <Button type="submit" disabled={isPending} className="ml-auto">
                {isPending ? "登録中..." : "登録する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

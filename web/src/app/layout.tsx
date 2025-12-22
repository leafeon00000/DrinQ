import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import type { ReactNode } from "react"

export const dynamic = "force-dynamic"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
export const metadata: Metadata = {
  title: "DrinQ",
  description: "あなたの好みに合う一杯を。",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.variable} ${mono.variable}`}>{children}</body>
    </html>
  )
}

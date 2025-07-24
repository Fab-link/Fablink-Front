import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "옷 제작 플랫폼",
  description: "AI 기반 맞춤형 의류 제작 서비스",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  )
}

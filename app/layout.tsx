import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ContractProvider } from "@/contexts/contract-context"
import { TimeTrackerWidget } from "@/components/time-tracker-widget"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Právní LEGO - Tvoř smlouvy bez právníka",
  description: "Moderní aplikace pro vytváření právních smluv pomocí drag-and-drop systému",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="cs">
      <body className={`font-sans antialiased`}>
        <ContractProvider>
          {children}
          <TimeTrackerWidget />
        </ContractProvider>
        <Analytics />
      </body>
    </html>
  )
}

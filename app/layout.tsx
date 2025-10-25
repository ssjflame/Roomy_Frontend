import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Sora, Plus_Jakarta_Sans } from "next/font/google"

export const metadata: Metadata = {
  title: "Roomy - Shared Expense Management",
  description: "Create an account to spend smarter, together. Manage shared expenses with your roommates using smart wallets",
    generator: 'v0.app'
}

const fontSans = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sora", display: "swap" })
const fontBackup = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plus-jakarta", display: "swap" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontSans.className}>
      <body className={`${fontSans.variable} ${fontBackup.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}

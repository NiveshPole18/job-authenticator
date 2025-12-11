import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const robotoMono = Roboto_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Job Scheduler Dashboard",
  description: "Manage and monitor automated jobs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${robotoMono.className} bg-background text-foreground`}>
        <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100">{children}</div>
      </body>
    </html>
  )
}

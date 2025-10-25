import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PageTransition } from "@/components/page-transition"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kelas Nusantara",
  description:
    "Platform pelestarian budaya Indonesia — belajar langsung dari para maestro seni tradisional, dari tari hingga batik, sambil mendukung kesejahteraan mereka.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
          <Suspense fallback={<div className="min-h-screen" />}>
            <PageTransition>{children}</PageTransition>
            <Analytics />
            <Toaster richColors />
          </Suspense>
      </body>
    </html>
  )
}

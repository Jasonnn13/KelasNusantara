"use client"

import { Suspense, type ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"

import { PageTransition } from "@/components/page-transition"
import { ProfileProvider } from "@/components/profile-provider"

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <Suspense fallback={<div className="min-h-screen" />}>
        <PageTransition>{children}</PageTransition>
      </Suspense>
      <Analytics />
      <Toaster richColors position="top-center" />
    </ProfileProvider>
  )
}

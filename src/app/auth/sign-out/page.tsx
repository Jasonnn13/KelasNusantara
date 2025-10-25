"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SignOutPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get("next") || "/"

  useEffect(() => {
    let mounted = true
    supabase.auth
      .signOut()
      .catch(() => {})
      .finally(() => {
        if (!mounted) return
        router.replace(next)
      })
    return () => {
      mounted = false
    }
  }, [router, next])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-10 text-center">
      <p className="text-muted-foreground">Sedang keluar…</p>
    </main>
  )
}

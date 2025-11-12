"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { toast } from "sonner"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const search = useSearchParams()

  const next = search.get("next") || "/"

  useEffect(() => {
    // If already signed in, go to next
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Ensure profile exists (insert if missing)
      const user = data.user
      if (user) {
        // Prefer the desired_role stored in user metadata from sign-up (parse safely to avoid any)
        const Meta = z.object({ desired_role: z.enum(["student", "maestro"]).optional() }).passthrough()
        const parse = Meta.safeParse(user.user_metadata)
        const desired = parse.success ? parse.data.desired_role : undefined
        const role: "student" | "maestro" = desired ?? "student"
        await supabase.from("profiles").upsert({ id: user.id, role })
      }
      toast.success("Berhasil masuk")
      router.replace(next)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!email) {
      toast.error("Masukkan email terlebih dahulu")
      return
    }
    setResetLoading(true)
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL
      const redirectTo = origin ? `${origin.replace(/\/$/, "")}/auth/update-password` : undefined
      const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)
      if (error) throw error
      toast.success("Cek email untuk tautan pemulihan kata sandi")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tidak dapat mengirim tautan reset"
      toast.error(message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-10">
        <h1 className="text-2xl font-semibold">Masuk</h1>
        <p className="mt-2 text-sm text-muted-foreground">Masuk dengan email dan kata sandi.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            required
            className="w-full rounded-md border px-3 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi"
            required
            className="w-full rounded-md border px-3 py-2"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:opacity-90">
              {loading ? "Memproses…" : "Masuk"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResetPassword}
              disabled={loading || resetLoading}
              className="text-sm"
            >
              {resetLoading ? "Mengirim tautan…" : "Lupa kata sandi?"}
            </Button>
            <Link href={{ pathname: "/auth/register", query: { next } }} className="ml-auto self-center text-sm underline">
              Belum punya akun? Daftar
            </Link>
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  )
}

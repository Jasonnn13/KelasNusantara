"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "maestro">("student")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get("next") || "/"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      // Store desired role in user metadata for first sign-in processing if email confirmation is required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { desired_role: role } },
      })
      if (error) throw error

      if (data.user && data.session) {
        // Session available: we can create profile immediately
        const user = data.user
        await supabase.from("profiles").upsert({ id: user.id, role })
        router.replace(next)
      } else {
        setMessage("Akun dibuat. Cek email untuk konfirmasi sebelum masuk.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold">Daftar Akun</h1>
      <p className="mt-2 text-sm text-muted-foreground">Gunakan email dan kata sandi, pilih peranmu.</p>

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
          placeholder="Kata sandi minimal 6 karakter"
          required
          minLength={6}
          className="w-full rounded-md border px-3 py-2"
        />
        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
            />
            <span>Saya murid</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="maestro"
              checked={role === "maestro"}
              onChange={() => setRole("maestro")}
            />
            <span>Saya maestro</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:opacity-90">
            {loading ? "Mendaftar…" : "Daftar"}
          </Button>
          <Link href={{ pathname: "/auth/sign-in", query: { next } }} className="text-sm underline">
            Sudah punya akun? Masuk
          </Link>
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </main>
  )
}

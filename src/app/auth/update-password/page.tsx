"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error || !data.user) {
          setHasSession(false)
        } else {
          setHasSession(true)
        }
      })
      .catch(() => {
        setHasSession(false)
      })
      .finally(() => {
        setChecking(false)
      })
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasSession) {
      toast.error("Sesi tidak ditemukan. Coba kirim ulang tautan reset.")
      return
    }
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success("Kata sandi berhasil diperbarui. Silakan masuk kembali.")
      await supabase.auth.signOut()
      router.replace("/auth/sign-in")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tidak dapat memperbarui kata sandi"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-10">
        {checking ? (
          <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p>Memeriksa sesi reset kata sandi…</p>
          </div>
        ) : hasSession ? (
          <>
            <h1 className="text-2xl font-semibold">Perbarui Kata Sandi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Buat kata sandi baru untuk akunmu. Setelah selesai kamu akan diminta masuk kembali.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Kata sandi baru
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Konfirmasi kata sandi
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:opacity-90">
                {loading ? "Menyimpan…" : "Simpan kata sandi"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-semibold">Tautan tidak berlaku</h1>
            <p className="text-sm text-muted-foreground">
              Sesi reset tidak ditemukan atau sudah kadaluarsa. Kirim ulang tautan reset kata sandi.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/auth/sign-in">Kembali ke masuk</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/register">Daftar akun baru</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}

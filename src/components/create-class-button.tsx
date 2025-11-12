"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

type CreateClassButtonProps = {
  className?: string
}

export function CreateClassButton({ className }: CreateClassButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        toast.error("Masuk terlebih dahulu untuk membuat kelas.")
        router.push("/auth/sign-in?next=/kelas/new")
        return
      }

      let role = typeof user.user_metadata?.role === "string" ? (user.user_metadata.role as string) : null

      if (!role) {
        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          toast.error("Tidak dapat memeriksa peran pengguna.")
          return
        }

        role = profileRow?.role ?? null
      }

      if (role !== "maestro") {
        toast.info("Hanya maestro yang dapat membuat kelas. Ajukan profil maestro terlebih dahulu.")
        return
      }

      router.push("/kelas/new")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} className={className} disabled={loading}>
      {loading ? "Mengecek peran…" : "Buat Kelas"}
    </Button>
  )
}

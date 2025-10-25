"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function EnrollButton({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) {
        // Send to sign-in with return path
        router.push(`/auth/sign-in?next=/kelas/${classId}`)
        return
      }

      const { error } = await supabase.from("enrollments").insert({ user_id: user.id, class_id: classId })
      if (error && error.message.includes("duplicate key")) {
        alert("Kamu sudah terdaftar di kelas ini.")
      } else if (error) {
        alert(`Gagal mendaftar: ${error.message}`)
      } else {
        alert("Berhasil mendaftar! Selamat belajar.")
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={onClick} disabled={loading} className="bg-primary text-primary-foreground hover:opacity-90">
      {loading ? "Memproses…" : "Daftar Kelas"}
    </Button>
  )
}

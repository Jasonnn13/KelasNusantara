"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface ConfirmEnrollButtonProps {
  classId: string
  classTitle: string
}

export function ConfirmEnrollButton({ classId, classTitle }: ConfirmEnrollButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (loading) return
    setLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        router.push(`/auth/sign-in?next=/daftar/${classId}`)
        return
      }

      const enrollResponse = await supabase
        .from("enrollments")
        .upsert({ user_id: user.id, class_id: classId }, { onConflict: "user_id,class_id" })
      if (enrollResponse.error) {
        throw enrollResponse.error
      }

      const joinResponse = await supabase
        .from("class_join_events")
        .upsert({ user_id: user.id, class_id: classId }, { onConflict: "user_id,class_id" })
      if (joinResponse.error) {
        throw joinResponse.error
      }

      toast.success(`Berhasil mendaftar untuk ${classTitle}`)
      router.push(`/kelas/${classId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleConfirm}
      disabled={loading}
      className="bg-primary text-primary-foreground hover:opacity-90"
    >
      {loading ? "Memproses…" : "Konfirmasi Daftar"}
    </Button>
  )
}

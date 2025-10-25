"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type Props = { maestroId: string }

export function FollowButton({ maestroId }: Props) {
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setFollowing(false); return }
        const { data, error } = await supabase
          .from("follows_maestros")
          .select("maestro_id")
          .eq("maestro_id", maestroId)
          .eq("user_id", user.id)
          .maybeSingle()
        if (error) throw error
        if (!mounted) return
        setFollowing(!!data)
      } catch {
        if (!mounted) return
        setFollowing(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [maestroId])

  async function toggle() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/auth/sign-in?next=/maestro`); return }
      if (following) {
        const { error } = await supabase
          .from("follows_maestros")
          .delete()
          .eq("user_id", user.id)
          .eq("maestro_id", maestroId)
        if (error) throw error
        setFollowing(false)
        toast.success("Berhenti mengikuti maestro.")
      } else {
        const { error } = await supabase
          .from("follows_maestros")
          .insert({ user_id: user.id, maestro_id: maestroId })
        if (error) throw error
        setFollowing(true)
        toast.success("Sekarang mengikuti maestro.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const label = following ? "Mengikuti" : "Ikuti Maestro"

  return (
    <Button size="sm" onClick={toggle} disabled={loading} className={following ? "bg-muted text-foreground" : "bg-secondary text-secondary-foreground hover:opacity-90"}>
      {loading ? "Memproses…" : label}
    </Button>
  )
}

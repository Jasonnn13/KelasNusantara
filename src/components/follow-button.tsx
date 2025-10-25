"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

type Props = { maestroId: string }

export function FollowButton({ maestroId }: Props) {
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setFollowing(false); return }
      const { data } = await supabase
        .from("follows_maestros")
        .select("maestro_id")
        .eq("maestro_id", maestroId)
        .eq("user_id", user.id)
        .maybeSingle()
      if (!mounted) return
      setFollowing(!!data)
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
      } else {
        const { error } = await supabase
          .from("follows_maestros")
          .insert({ user_id: user.id, maestro_id: maestroId })
        if (error) throw error
        setFollowing(true)
      }
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

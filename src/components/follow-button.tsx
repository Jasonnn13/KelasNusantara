"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useProfile } from "@/components/profile-provider"
import { supabase } from "@/lib/supabase"

type Props = { maestroId: string }

type Listener = {
  id: string
  callback: (value: boolean | null) => void
}

const followCache = new Map<string, boolean>()
const listeners = new Set<Listener>()

function notify(maestroId: string) {
  const value = followCache.has(maestroId) ? followCache.get(maestroId)! : null
  listeners.forEach((listener) => {
    if (listener.id === maestroId) listener.callback(value)
  })
}

function subscribe(maestroId: string, callback: (value: boolean | null) => void) {
  const listener: Listener = { id: maestroId, callback }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function FollowButton({ maestroId }: Props) {
  const router = useRouter()
  const { authState, profile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState<boolean | null>(() =>
    followCache.has(maestroId) ? followCache.get(maestroId)! : null
  )

  useEffect(() => subscribe(maestroId, setFollowing), [maestroId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (followCache.has(maestroId)) {
        setFollowing(followCache.get(maestroId) ?? false)
        return
      }

      if (authState !== "authenticated" || !profile) {
        setFollowing(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("follows_maestros")
          .select("maestro_id")
          .eq("maestro_id", maestroId)
          .eq("user_id", profile.id)
          .maybeSingle()

        if (error) throw error

        if (cancelled) return

        const isFollowing = Boolean(data)
        followCache.set(maestroId, isFollowing)
        setFollowing(isFollowing)
        notify(maestroId)
      } catch {
        if (cancelled) return
        followCache.set(maestroId, false)
        setFollowing(false)
        notify(maestroId)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [authState, maestroId, profile])

  const buttonLabel = useMemo(() => {
    if (loading) return "Memproses…"
    if (following === null) return "Memuat…"
    return following ? "Mengikuti" : "Ikuti Maestro"
  }, [following, loading])

  async function toggle() {
    if (authState !== "authenticated" || !profile) {
      router.push(`/auth/sign-in?next=/maestro`)
      return
    }

    if (following === null) return

    setLoading(true)
    try {
      if (following) {
        const { error } = await supabase
          .from("follows_maestros")
          .delete()
          .eq("user_id", profile.id)
          .eq("maestro_id", maestroId)
        if (error) throw error
        followCache.set(maestroId, false)
        setFollowing(false)
        notify(maestroId)
        toast.success("Berhenti mengikuti maestro.")
      } else {
        const { error } = await supabase
          .from("follows_maestros")
          .insert({ user_id: profile.id, maestro_id: maestroId })
        if (error) throw error
        followCache.set(maestroId, true)
        setFollowing(true)
        notify(maestroId)
        toast.success("Sekarang mengikuti maestro.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memproses."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const buttonClass = following ? "bg-muted text-foreground" : "bg-secondary text-secondary-foreground hover:opacity-90"

  return (
    <Button size="sm" onClick={toggle} disabled={loading || following === null} className={buttonClass}>
      {buttonLabel}
    </Button>
  )
}

"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { supabase } from "@/lib/supabase"

type AuthState = "loading" | "authenticated" | "unauthenticated"

type ProfileSummary = {
  id: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
}

type ProfileContextValue = {
  authState: AuthState
  profile: ProfileSummary | null
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  const loadProfile = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const { data, error } = await supabase.auth.getUser()
      if (!mountedRef.current) return

      if (error || !data.user) {
        setAuthState("unauthenticated")
        setProfile(null)
        return
      }

      const user = data.user
      const baseProfile: ProfileSummary = {
        id: user.id,
        email: user.email ?? null,
        fullName: null,
        avatarUrl: null,
      }

      setAuthState("authenticated")
      setProfile((current) => current ?? baseProfile)

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!mountedRef.current) return

      if (profileError) {
        setProfile((current) => current ?? baseProfile)
        return
      }

      setProfile({
        ...baseProfile,
        fullName: profileRow?.full_name ?? null,
        avatarUrl: profileRow?.avatar_url ?? null,
      })
    } finally {
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadProfile()
    return () => {
      mountedRef.current = false
    }
  }, [loadProfile])

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return
      if (session?.user) {
        loadProfile()
      } else {
        setAuthState("unauthenticated")
        setProfile(null)
      }
    })

    return () => {
      data?.subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo(
    () => ({
      authState,
      profile,
      refreshProfile: loadProfile,
    }),
    [authState, profile, loadProfile]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider")
  }
  return context
}

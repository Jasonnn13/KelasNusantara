"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface ProfileOverview {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: "student" | "maestro" | "admin"
  display_name: string | null
  region: string | null
  discipline: string | null
  bio: string | null
  enrollments_count: number
  follows_count: number
  created_at: string | null
}

type ProfileState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "error"; message: string }
  | { status: "ready"; profile: ProfileOverview }

export default function ProfilePage() {
  const [state, setState] = useState<ProfileState>({ status: "loading" })
  const mountedRef = useRef(true)

  const loadProfile = useCallback(async () => {
    setState((current) => (current.status === "ready" ? current : { status: "loading" }))

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (!mountedRef.current) return

    if (sessionError) {
      setState({ status: "error", message: sessionError.message })
      return
    }

    const session = sessionData.session
    const user = session?.user
    if (!user) {
      setState({ status: "unauthenticated" })
      return
    }

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>

    const baseProfile: ProfileOverview = {
      id: user.id,
      email: user.email ?? null,
      full_name: typeof metadata.full_name === "string" ? metadata.full_name : null,
      avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
      role: (typeof metadata.role === "string" ? metadata.role : "student") as ProfileOverview["role"],
      display_name: typeof metadata.display_name === "string" ? metadata.display_name : null,
      region: typeof metadata.region === "string" ? metadata.region : null,
      discipline: typeof metadata.discipline === "string" ? metadata.discipline : null,
      bio: typeof metadata.bio === "string" ? metadata.bio : null,
      enrollments_count: 0,
      follows_count: 0,
      created_at: user.created_at ?? null,
    }

    setState({ status: "ready", profile: baseProfile })

    const { data, error } = await supabase
      .from("v_profile_overview")
      .select(
        "id, email, full_name, avatar_url, role, display_name, region, discipline, bio, enrollments_count, follows_count, created_at"
      )
      .eq("id", user.id)
      .maybeSingle()

    if (!mountedRef.current) return

    if (error) {
      console.warn("Gagal memuat detail profil", error.message)
      return
    }

    if (!data) return

    const overview = data as ProfileOverview
    setState({
      status: "ready",
      profile: {
        ...baseProfile,
        ...overview,
        email: overview.email ?? baseProfile.email,
      },
    })
  }, [])

  useEffect(() => {
    loadProfile()
    return () => {
      mountedRef.current = false
    }
  }, [loadProfile])

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadProfile()
      }
      if (event === "SIGNED_OUT") {
        setState({ status: "unauthenticated" })
      }
    })

    return () => {
      data?.subscription.unsubscribe()
    }
  }, [loadProfile])

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-4xl px-4 py-12">
        {state.status === "unauthenticated" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Masuk untuk melihat profilmu.</p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/auth/sign-in">Masuk</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/register">Daftar</Link>
              </Button>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-destructive">Terjadi kesalahan saat memuat profil.</p>
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Button onClick={loadProfile}>Coba lagi</Button>
          </div>
        )}

  {state.status === "ready" && <ProfileOverviewCard profile={state.profile} />}
  {state.status === "loading" && <ProfileSkeleton />}
      </section>
      <SiteFooter />
    </main>
  )
}

function ProfileOverviewCard({ profile }: { profile: ProfileOverview }) {
  const name = profile.full_name || profile.display_name || profile.email || "Pengguna Nusantara"
  const roleLabel =
    profile.role === "maestro" ? "Maestro" : profile.role === "admin" ? "Admin" : "Murid"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-muted/40">
            <Image
              src={profile.avatar_url || "/placeholder.svg"}
              alt={name}
              fill
              sizes="96px"
              className="object-cover"
              priority={false}
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">{name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{roleLabel}</CardDescription>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="self-center md:self-start">
          <Link href="/profile/edit">Edit Profil</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <SectionHeading title="Informasi Dasar" />
          <InfoRow label="Email" value={profile.email ?? "Belum diisi"} />
          <InfoRow label="Peran" value={roleLabel} />
          <InfoRow label="Bergabung" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID") : "-"} />
        </div>
        <div className="space-y-4">
          <SectionHeading title="Aktivitas" />
          <InfoRow label="Kelas diikuti" value={`${profile.enrollments_count} kelas`} />
          <InfoRow label="Maestro diikuti" value={`${profile.follows_count} maestro`} />
          {profile.role === "maestro" && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Profil Maestro</p>
              <p className="mt-1">{profile.display_name ?? "Nama panggung belum diisi."}</p>
              <p className="mt-1">
                {profile.discipline ? `Disiplin: ${profile.discipline}` : "Disiplin belum diisi."}
              </p>
              <p className="mt-1">
                {profile.region ? `Region: ${profile.region}` : "Wilayah ajar belum diisi."}
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                {profile.bio ?? "Tambahkan biografi untuk memperkenalkan diri kepada murid."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

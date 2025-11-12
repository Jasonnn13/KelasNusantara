"use client"

import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
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

type JoinedClass = {
  id: string
  title: string
  category: string | null
  thumbnail_url: string | null
  maestro_name: string | null
  joined_at: string
}

type FollowedMaestro = {
  id: string
  display_name: string
  region: string | null
  discipline: string | null
  photo_url: string | null
  followed_at: string
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")

function normalizeStoragePath(path: string) {
  return path.replace(/^public\//, "").replace(/^\/?media\//, "")
}

function resolvePublicMediaUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith("http")) return path
  if (path.startsWith("/")) return path
  const cleaned = normalizeStoragePath(path)
  if (!SUPABASE_URL) return `/media/${cleaned}`
  return `${SUPABASE_URL}/storage/v1/object/public/media/${cleaned}`
}

export default function ProfilePage() {
  const [state, setState] = useState<ProfileState>({ status: "loading" })
  const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([])
  const [followedMaestros, setFollowedMaestros] = useState<FollowedMaestro[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const mountedRef = useRef(true)

  const loadJoinedClasses = useCallback(
    async (userId: string) => {
      const { data: eventsRaw, error } = await supabase
        .from("class_join_events")
        .select("class_id, joined_at")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
        .limit(12)

      if (!mountedRef.current) return

      if (error || !eventsRaw || eventsRaw.length === 0) {
        setJoinedClasses([])
        return
      }

      type EventRow = { class_id: string; joined_at: string }
      const events = eventsRaw as EventRow[]
      const classIds = events.map((item) => item.class_id)

      const { data: classesRaw, error: classesError } = await supabase
        .from("v_classes")
        .select("id, title, category, thumbnail_url, maestro_name")
        .in("id", classIds)

      if (!mountedRef.current) return

      if (classesError || !classesRaw) {
        setJoinedClasses([])
        return
      }

      type ClassRow = {
        id: string
        title: string
        category: string | null
        thumbnail_url: string | null
        maestro_name: string | null
      }

      const classMap = new Map<string, ClassRow>(
        (classesRaw as ClassRow[]).map((row) => [row.id, row])
      )

      const ordered = events
        .map((event) => {
          const info = classMap.get(event.class_id)
          if (!info) return null
          return {
            id: info.id,
            title: info.title,
            category: info.category,
            thumbnail_url: resolvePublicMediaUrl(info.thumbnail_url),
            maestro_name: info.maestro_name,
            joined_at: event.joined_at,
          } satisfies JoinedClass
        })
        .filter(Boolean) as JoinedClass[]

      setJoinedClasses(ordered)
    },
    []
  )

  const loadFollowedMaestros = useCallback(
    async (userId: string) => {
      const { data: followRaw, error } = await supabase
        .from("follows_maestros")
        .select("maestro_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12)

      if (!mountedRef.current) return

      if (error || !followRaw || followRaw.length === 0) {
        setFollowedMaestros([])
        return
      }

      type FollowRow = { maestro_id: string; created_at: string }
      const follows = followRaw as FollowRow[]
      const maestroIds = follows.map((item) => item.maestro_id)

      const { data: maestrosRaw, error: maestrosError } = await supabase
        .from("maestros")
        .select("id, display_name, region, discipline, photo_url")
        .in("id", maestroIds)

      if (!mountedRef.current) return

      if (maestrosError || !maestrosRaw) {
        setFollowedMaestros([])
        return
      }

      type MaestroRow = {
        id: string
        display_name: string
        region: string | null
        discipline: string | null
        photo_url: string | null
      }

      const maestroMap = new Map<string, MaestroRow>(
        (maestrosRaw as MaestroRow[]).map((row) => [row.id, row])
      )

      const ordered = follows
        .map((item) => {
          const info = maestroMap.get(item.maestro_id)
          if (!info) return null
          return {
            id: info.id,
            display_name: info.display_name,
            region: info.region,
            discipline: info.discipline,
            photo_url: resolvePublicMediaUrl(info.photo_url),
            followed_at: item.created_at,
          } satisfies FollowedMaestro
        })
        .filter(Boolean) as FollowedMaestro[]

      setFollowedMaestros(ordered)
    },
    []
  )

  const loadProfile = useCallback(async () => {
    setState((current) => (current.status === "ready" ? current : { status: "loading" }))

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (!mountedRef.current) return

    if (sessionError) {
      setState({ status: "error", message: sessionError.message })
      setActivityLoading(false)
      return
    }

    const session = sessionData.session
    const user = session?.user
    if (!user) {
      setState({ status: "unauthenticated" })
      setActivityLoading(false)
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

    setActivityLoading(true)
    void (async () => {
      await Promise.all([loadJoinedClasses(user.id), loadFollowedMaestros(user.id)])
      if (mountedRef.current) setActivityLoading(false)
    })()

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
  }, [loadFollowedMaestros, loadJoinedClasses])

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
        setJoinedClasses([])
        setFollowedMaestros([])
        setActivityLoading(false)
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

        {state.status === "ready" && (
          <ProfileOverviewCard
            profile={state.profile}
            joinedClasses={joinedClasses}
            followedMaestros={followedMaestros}
            activityLoading={activityLoading}
          />
        )}
        {state.status === "loading" && <ProfileSkeleton />}
      </section>
      <SiteFooter />
    </main>
  )
}

function ProfileOverviewCard({
  profile,
  joinedClasses,
  followedMaestros,
  activityLoading,
}: {
  profile: ProfileOverview
  joinedClasses: JoinedClass[]
  followedMaestros: FollowedMaestro[]
  activityLoading: boolean
}) {
  const name = profile.full_name || profile.display_name || profile.email || "Pengguna Nusantara"
  const roleLabel =
    profile.role === "maestro" ? "Maestro" : profile.role === "admin" ? "Admin" : "Murid"

  const highlightCards = useMemo(
    () => [
      {
        label: "Kelas diikuti",
        value: profile.enrollments_count,
        accent: "bg-emerald-500/10 text-emerald-600",
      },
      {
        label: "Maestro diikuti",
        value: profile.follows_count,
        accent: "bg-sky-500/10 text-sky-600",
      },
    ],
    [profile.enrollments_count, profile.follows_count]
  )

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden bg-gradient-to-br from-background via-background to-muted/40">
        <CardHeader className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-muted/50 shadow-inner">
              <Image
                src={profile.avatar_url || "/placeholder.svg"}
                alt={name}
                fill
                sizes="112px"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {roleLabel}
              </div>
              <CardTitle className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">{name}</CardTitle>
              <CardDescription className="max-w-xl text-sm text-muted-foreground md:text-base">
                {profile.bio ?? "Perbarui biografi untuk memperkenalkan dirimu kepada komunitas Nusantara."}
              </CardDescription>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-full border-2 px-5 py-2 text-sm font-semibold">
            <Link href="/profile/edit">Edit Profil</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border bg-card/70 p-6 shadow-sm">
            <SectionHeading title="Informasi Dasar" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Email" value={profile.email ?? "Belum diisi"} />
              <InfoRow
                label="Bergabung"
                value={
                  profile.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }) : "-"
                }
              />
            </div>
            {profile.role === "maestro" && (
              <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 p-4">
                <SectionHeading title="Profil Maestro" />
                <dl className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <InfoRow label="Nama panggung" value={profile.display_name ?? "Belum diisi"} isDefinition />
                  <InfoRow label="Disiplin" value={profile.discipline ?? "Belum diisi"} isDefinition />
                  <InfoRow label="Region" value={profile.region ?? "Belum diisi"} isDefinition />
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
                  Lengkapi profil maestro agar murid dapat mengenal keahlianmu dengan cepat.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {highlightCards.map((item) => (
              <div key={item.label} className={`rounded-2xl border bg-card/80 p-5 shadow-sm`}> 
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                <p className={`mt-2 text-3xl font-semibold ${item.accent}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ActivitySection
        title="Kelas yang Kamu Ikuti"
        description="Pantau kelas yang sudah kamu konfirmasi untuk tetap termotivasi belajar."
        emptyLabel="Belum ada kelas yang diikuti."
        ctaHref="/kelas"
        ctaLabel="Cari Kelas"
        loading={activityLoading}
      >
        {joinedClasses.map((item) => (
          <JoinedClassCard key={item.id} data={item} />
        ))}
      </ActivitySection>

      <ActivitySection
        title="Maestro yang Kamu Ikuti"
        description="Ikuti maestro favorit agar tidak ketinggalan kelas dan pembaruan terbaru."
        emptyLabel="Belum mengikuti maestro mana pun."
        ctaHref="/maestro"
        ctaLabel="Temukan Maestro"
        loading={activityLoading}
      >
        {followedMaestros.map((item) => (
          <FollowedMaestroCard key={item.id} data={item} />
        ))}
      </ActivitySection>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">{title}</h2>
}

function InfoRow({ label, value, isDefinition = false }: { label: string; value: string; isDefinition?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className={`text-sm ${isDefinition ? "text-muted-foreground" : "text-foreground"}`}>{value}</p>
    </div>
  )
}

function ActivitySection({
  title,
  description,
  emptyLabel,
  ctaHref,
  ctaLabel,
  loading,
  children,
}: {
  title: string
  description: string
  emptyLabel: string
  ctaHref: string
  ctaLabel: string
  loading: boolean
  children: ReactNode
}) {
  const contentCount = useMemo(() => Children.count(children), [children])
  const hasContent = !loading && contentCount > 0

  return (
    <section className="rounded-3xl border bg-card/70 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-4 py-2 text-sm">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : hasContent ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {children}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground md:text-base">{emptyLabel}</p>
        </div>
      )}
    </section>
  )
}

function JoinedClassCard({ data }: { data: JoinedClass }) {
  return (
    <Link
      href={`/kelas/${data.id}`}
      className="group flex items-center gap-4 rounded-2xl border bg-background/80 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted/40">
        <Image
          src={data.thumbnail_url || "/placeholder.svg"}
          alt={data.title}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary">{data.title}</p>
        <p className="text-xs text-muted-foreground">
          {(data.category ?? "Umum")} • {data.maestro_name ?? "Maestro"}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80">
          Bergabung {new Date(data.joined_at).toLocaleDateString("id-ID")}
        </p>
      </div>
    </Link>
  )
}

function FollowedMaestroCard({ data }: { data: FollowedMaestro }) {
  return (
    <Link
      href={`/maestro/${data.id}`}
      className="group flex items-center gap-4 rounded-2xl border bg-background/80 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted/40">
        <Image
          src={data.photo_url || "/placeholder.svg"}
          alt={data.display_name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary">{data.display_name}</p>
        <p className="text-xs text-muted-foreground">
          {[data.discipline, data.region].filter(Boolean).join(" • ") || "Maestro Nusantara"}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80">
          Diikuti {new Date(data.followed_at).toLocaleDateString("id-ID")}
        </p>
      </div>
    </Link>
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

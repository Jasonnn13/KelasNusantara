"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CircleUser, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProfile } from "@/components/profile-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function SiteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const navLinks = useMemo(
    () => [
    { href: "/", label: "Beranda" },
    { href: "/kelas", label: "Kelas" },
    { href: "/maestro", label: "Maestro" },
    { href: "/tentang", label: "Tentang" },
    ],
    []
  )

  const [menuOpen, setMenuOpen] = useState(false)
  const { authState, profile, refreshProfile } = useProfile()
  const [maestroLoading, setMaestroLoading] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const profileInitial = profile?.fullName?.charAt(0).toUpperCase() ?? profile?.email?.charAt(0).toUpperCase() ?? null

  const profileControl = (() => {
    if (authState === "loading") {
      return (
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" disabled aria-label="Memuat status akun">
          <CircleUser className="h-5 w-5 animate-pulse text-muted-foreground" />
        </Button>
      )
    }

    if (authState === "unauthenticated") {
      return (
        <Button asChild size="sm" variant="ghost" className="text-sm">
          <Link href="/auth/sign-in">Masuk</Link>
        </Button>
      )
    }

    return (
      <Button
        asChild
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-full border border-border/60 bg-background/80 backdrop-blur hover:bg-accent"
      >
        <Link href="/profile" aria-label="Buka profil Anda">
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile?.fullName ? `Foto profil ${profile.fullName}` : "Foto profil"}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : profileInitial ? (
              <span className="text-sm font-semibold uppercase text-foreground">{profileInitial}</span>
            ) : (
              <CircleUser className="h-5 w-5 text-muted-foreground" />
            )}
          </span>
        </Link>
      </Button>
    )
  })()

  const handleBecomeMaestro = useCallback(async () => {
    if (maestroLoading) return
    setMaestroLoading(true)
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        toast.info("Masuk terlebih dahulu untuk mengubah peran.")
        router.push("/auth/sign-in?next=/profile/edit")
        return
      }

      const currentRole = typeof user.user_metadata?.role === "string" ? (user.user_metadata.role as string) : null

      if (currentRole !== "maestro") {
        const fallbackName =
          (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
          (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
          (user.email ? user.email.split("@")[0] : "Maestro Nusantara")

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: "maestro" })
          .eq("id", user.id)

        if (profileError) throw profileError

        const { error: maestroError } = await supabase.from("maestros").upsert({
          id: user.id,
          display_name: fallbackName,
          photo_url:
            typeof user.user_metadata?.avatar_url === "string" ? (user.user_metadata.avatar_url as string) : null,
        })

        if (maestroError) throw maestroError

        const { error: authUpdateError } = await supabase.auth.updateUser({ data: { role: "maestro" } })
        if (authUpdateError) throw authUpdateError

        toast.success("Peran diperbarui menjadi maestro. Lengkapi detail profilmu.")
      } else {
        const { error: maestroEnsureError } = await supabase.from("maestros").upsert({
          id: user.id,
          display_name:
            (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
            (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
            (user.email ? user.email.split("@")[0] : "Maestro Nusantara"),
          photo_url:
            typeof user.user_metadata?.avatar_url === "string" ? (user.user_metadata.avatar_url as string) : null,
        })

        if (maestroEnsureError) throw maestroEnsureError

        toast.message("Kamu sudah terdaftar sebagai maestro. Perbarui profilmu.")
      }

      await refreshProfile()
      router.push("/profile/edit")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tidak dapat mengubah peran maestro"
      toast.error(message)
    } finally {
      setMaestroLoading(false)
    }
  }, [maestroLoading, refreshProfile, router])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Kelas</span> <span className="text-foreground">Nusantara</span>
            <span className="sr-only">{"Beranda Kelas Nusantara"}</span>
          </Link>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-auto h-9 w-9 md:hidden"
            aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
            onClick={() => setMenuOpen((state) => !state)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <ul className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative pb-1 transition-colors",
                    isActive
                      ? "text-primary after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary after:content-['']"
                      : "hover:text-primary"
                  )}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
            <Link href="/kelas">Jelajahi Kelas</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={handleBecomeMaestro}
            disabled={maestroLoading}
          >
            {maestroLoading ? "Memproses…" : "Jadi Maestro"}
          </Button>
          {profileControl}
          <div className="w-[102px]">
            <Button
              asChild
              size="sm"
              variant="outline"
              className={cn(
                "text-sm transition-opacity duration-200",
                authState === "authenticated" ? "pointer-events-none opacity-0" : "opacity-100"
              )}
              aria-hidden={authState === "authenticated"}
            >
              <Link href="/auth/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "md:hidden",
          menuOpen ? "block" : "hidden"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-4">
          <ul className="flex flex-col gap-2 text-sm">
            {navLinks.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === href : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-md px-3 py-2 transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full bg-primary text-primary-foreground">
              <Link href="/kelas">Jelajahi Kelas</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              onClick={handleBecomeMaestro}
              disabled={maestroLoading}
            >
              {maestroLoading ? "Memproses…" : "Jadi Maestro"}
            </Button>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Akun</span>
              {profileControl}
            </div>
            {authState !== "authenticated" && (
              <Button asChild variant="ghost" className="w-full justify-center text-sm">
                <Link href="/auth/register">Daftar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

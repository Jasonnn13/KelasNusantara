"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleUser } from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function SiteNavbar() {
  const pathname = usePathname()
  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/kelas", label: "Kelas" },
    { href: "/maestro", label: "Maestro" },
    { href: "/tentang", label: "Tentang" },
  ]

  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function handleProfile(userId: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", userId)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.warn("Gagal memuat profil", error.message)
      }

      setProfileAvatar(data?.avatar_url ?? null)
      setProfileName(data?.full_name ?? null)
      setAuthState("authenticated")
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return
      if (error || !data.user) {
        setAuthState("unauthenticated")
        return
      }
      handleProfile(data.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user) {
        handleProfile(session.user.id)
      } else {
        setAuthState("unauthenticated")
        setProfileAvatar(null)
        setProfileName(null)
      }
    })

    return () => {
      active = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  const profileInitial = profileName?.charAt(0).toUpperCase() ?? null

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
            {profileAvatar ? (
              <Image
                src={profileAvatar}
                alt={profileName ? `Foto profil ${profileName}` : "Foto profil"}
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          <span className="text-primary">Kelas</span> <span className="text-foreground">Nusantara</span>
          <span className="sr-only">{"Beranda Kelas Nusantara"}</span>
        </Link>

        <ul className="hidden gap-6 text-sm md:flex">
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

        <div className="flex items-center gap-2">
          <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
            <Link href="/kelas">Jelajahi Kelas</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
          >
            <Link href="/maestro">Jadi Maestro</Link>
          </Button>
          {profileControl}
          <div className="hidden w-[102px] md:block">
            <Button
              asChild
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
    </header>
  )
}

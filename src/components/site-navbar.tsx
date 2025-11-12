"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleUser, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProfile } from "@/components/profile-provider"

export function SiteNavbar() {
  const pathname = usePathname()
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
  const { authState, profile } = useProfile()

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
            asChild
            size="sm"
            variant="outline"
            className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            <Link href="/maestro">Jadi Maestro</Link>
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
              asChild
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <Link href="/maestro">Jadi Maestro</Link>
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

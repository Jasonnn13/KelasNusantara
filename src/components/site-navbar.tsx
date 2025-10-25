"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function SiteNavbar() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setSignedIn(!!data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setSignedIn(!!session?.user)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          <span className="text-primary">Kelas</span> <span className="text-foreground">Nusantara</span>
          <span className="sr-only">{"Beranda Kelas Nusantara"}</span>
        </Link>

        <ul className="hidden gap-6 text-sm md:flex">
          <li>
            <Link href="/kelas" className="hover:text-primary">
              Kelas
            </Link>
          </li>
          <li>
            <Link href="/maestro" className="hover:text-primary">
              Maestro
            </Link>
          </li>
          <li>
            <Link href="/tentang" className="hover:text-primary">
              Tentang
            </Link>
          </li>
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
          {signedIn === false && (
            <Button asChild variant="ghost">
              <Link href="/auth/sign-in">Masuk</Link>
            </Button>
          )}
          {signedIn === true && (
            <Button asChild variant="ghost">
              <Link href={{ pathname: "/auth/sign-out", query: { next: "/" } }}>Keluar</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}

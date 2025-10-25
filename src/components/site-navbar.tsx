"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteNavbar() {
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
          {/* Auth buttons hidden for now per request */}
        </div>
      </nav>
    </header>
  )
}

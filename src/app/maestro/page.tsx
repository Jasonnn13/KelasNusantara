import Link from "next/link"
import { Suspense } from "react"

import { MaestroCard } from "@/components/maestro-card"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { getMaestros } from "@/lib/queries"

export const revalidate = 60

async function MaestroGrid() {
  let maestros: Array<{
    id: string
    display_name: string
    region: string | null
    discipline: string | null
    bio: string | null
    photo_url: string | null
  }>
  try {
    maestros = await getMaestros(24)
  } catch {
    maestros = []
  }

  if (!maestros.length) {
    maestros = Array.from({ length: 6 }).map((_, i) => ({
      id: `dummy-${i}`,
      display_name: `Maestro Dummy ${i + 1}`,
      region: "Nusantara",
      discipline: "Seni",
      bio: "Profil maestro dummy.",
      photo_url: "/placeholder.svg",
    }))
  }
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {maestros.map((m) => (
        <MaestroCard
          key={m.id}
          id={m.id}
          name={m.display_name ?? ""}
          region={m.region ?? ""}
          discipline={m.discipline ?? ""}
          bio={m.bio ?? ""}
          imageUrl={m.photo_url ?? "/placeholder.svg"}
        />
      ))}
    </div>
  )
}

export default function MaestroPage() {
  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Maestro Nusantara</h1>
            <p className="mt-2 text-muted-foreground">
              Kenali para maestro yang menjaga dan mengajarkan warisan budaya kita.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
            <Link href="/maestro">Ajukan Diri sebagai Maestro</Link>
          </Button>
        </div>
        <Suspense fallback={<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-20 rounded-md bg-muted/50"/>))}</div>}>
          <MaestroGrid />
        </Suspense>
      </section>
      <SiteFooter />
    </main>
  )
}

import { Suspense } from "react"

import { ClassCard } from "@/components/class-card"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { getFeaturedClasses } from "@/lib/queries"

export const revalidate = 60

async function ClassesGrid() {
  let classes: Array<{
    id: string
    title: string
    description: string
    category: string
    thumbnail_url: string | null
  }>

  try {
    const rows = await getFeaturedClasses(24)
    classes = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      category: r.category ?? "Umum",
      thumbnail_url: r.thumbnail_url,
    }))
  } catch {
    classes = []
  }

  if (!classes.length) {
    classes = Array.from({ length: 6 }).map((_, i) => ({
      id: `dummy-${i}`,
      title: `Kelas Dummy ${i + 1}`,
      description: "Deskripsi singkat kelas dummy.",
      category: "Umum",
      thumbnail_url: "/placeholder.svg",
    }))
  }
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((c) => (
        <ClassCard
          key={c.id}
          id={c.id}
          title={c.title}
          category={c.category}
          description={c.description}
          imageUrl={c.thumbnail_url ?? "/placeholder.svg"}
        />
      ))}
    </div>
  )
}

export default function KelasPage() {
  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Semua Kelas</h1>
        <p className="mt-2 text-muted-foreground">Pilih kelas favoritmu dari seluruh Nusantara.</p>
        <Suspense fallback={<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-40 rounded-md bg-muted/50"/>))}</div>}>
          <ClassesGrid />
        </Suspense>
      </section>
      <SiteFooter />
    </main>
  )
}

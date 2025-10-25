import Link from "next/link"

import { SiteNavbar } from "@/components/site-navbar"
import { HeroSection } from "@/components/hero-section"
import { ClassCard } from "@/components/class-card"
import { MaestroCard } from "@/components/maestro-card"
import { SiteFooter } from "@/components/site-footer"
import { getFeaturedClasses, getMaestros } from "@/lib/queries"

export default async function HomePage() {
  const [classes, maestros] = await Promise.all([
    getFeaturedClasses(6),
    getMaestros(6),
  ])

  return (
    <main>
      <SiteNavbar />
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Kelas Pilihan</h2>
        <p className="mt-2 text-muted-foreground">Belajar seni tradisional dari ujung Aceh hingga Papua.</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              title={c.title}
              category={c.category ?? "Umum"}
              description={c.description ?? ""}
              imageUrl={c.thumbnail_url ?? "/placeholder.svg"}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-xl border bg-card p-6 md:p-10">
          <h3 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Jadilah bagian dari pelestarian budaya
          </h3>
          <p className="mt-2 text-pretty text-muted-foreground">
            Daftar sebagai maestro untuk membuka kelas berbayar, atau sebagai murid untuk belajar langsung dari
            sumbernya.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/maestro"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Daftar sebagai Maestro
            </Link>
            <Link
              href="/kelas"
              className="inline-flex items-center rounded-md border border-secondary px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              Lihat Semua Kelas
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Maestro Pilihan</h2>
        <p className="mt-2 text-muted-foreground">Tokoh pengajar yang berdedikasi menjaga warisan budaya Nusantara.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maestros.map((m) => (
            <MaestroCard
              key={m.id}
              id={m.id}
              name={m.display_name}
              region={m.region ?? ""}
              discipline={m.discipline ?? ""}
              bio={m.bio ?? ""}
              imageUrl={m.photo_url ?? "/placeholder.svg"}
            />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

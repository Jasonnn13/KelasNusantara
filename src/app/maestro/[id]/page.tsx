import Image from "next/image"
import Link from "next/link"

import { ClassCard } from "@/components/class-card"
import { Button } from "@/components/ui/button"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { getMaestroById, getClassesByMaestroId, type MaestroClassSummary } from "@/lib/queries"

export const revalidate = 30

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const maestro = await getMaestroById(id)

  const classes: MaestroClassSummary[] = maestro
    ? await getClassesByMaestroId(id).catch(() => [] as MaestroClassSummary[])
    : []

  if (!maestro) {
    if (id.startsWith("dummy-")) {
      const data = {
        id,
        display_name: `Maestro Dummy ${id.replace("dummy-", "")}`,
        discipline: "Seni",
        region: "Nusantara",
        bio: "Biografi singkat maestro dummy untuk pratinjau.",
        photo_url: "/placeholder.svg",
      }
      return (
        <main>
          <SiteNavbar />
          <section className="mx-auto max-w-4xl px-4 py-10">
            <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-muted/40">
              <Image src={data.photo_url} alt={data.display_name} fill sizes="112px" className="object-cover" />
            </div>
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{data.display_name}</h1>
              <p className="mt-2 text-muted-foreground">{data.discipline} • {data.region}</p>
            </div>
            <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">{data.bio}</p>
            <p className="text-xs text-muted-foreground">Halaman pratinjau dummy.</p>
            <Button asChild variant="secondary"><Link href="/maestro">Kembali ke daftar maestro</Link></Button>
            </div>
          </section>
          <SiteFooter />
        </main>
      )
    }
    return (
      <main>
        <SiteNavbar />
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Maestro tidak ditemukan.</p>
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link href="/maestro">Kembali ke daftar maestro</Link>
            </Button>
          </div>
        </section>
        <SiteFooter />
      </main>
    )
  }

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full bg-muted/40">
            <Image
              src={maestro.photo_url ?? "/placeholder.svg"}
              alt={maestro.display_name}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{maestro.display_name}</h1>
            <p className="mt-2 text-muted-foreground">
              {(maestro.discipline ?? "")} {maestro.region ? `• ${maestro.region}` : ""}
            </p>
          </div>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">{maestro.bio}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Kelas oleh {maestro.display_name}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              Ikuti sesi pembelajaran yang dipandu langsung oleh maestro dan pelajari tradisi dari sumbernya.
            </p>
          </div>
        </div>

        {classes.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => (
              <ClassCard
                key={item.id}
                id={item.id}
                title={item.title}
                category={item.category ?? "Umum"}
                description={item.description ?? ""}
                imageUrl={item.thumbnail_url ?? "/placeholder.svg"}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground md:text-base">
              {maestro.display_name} belum memiliki kelas aktif saat ini.
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/kelas">Jelajahi kelas lainnya</Link>
            </Button>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}

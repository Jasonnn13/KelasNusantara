import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export const revalidate = 30

async function getMaestroById(id: string) {
  const { data, error } = await supabase
    .from("maestros")
    .select("id, display_name, region, discipline, bio, photo_url")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const maestro = await getMaestroById(id)

  function normalizeStoragePath(path: string) {
    let p = path.replace(/^public\//, "").replace(/^\/?media\//, "")
    if (p.endsWith(".jpg")) p = p.replace(/\.jpg$/i, ".png")
    return p
  }
  function resolveStorageUrl(path: string | null | undefined) {
    if (!path) return null
    if (path.startsWith("http")) return path
    if (path.startsWith("/")) return path
    const { data } = supabase.storage.from("media").getPublicUrl(normalizeStoragePath(path))
    return data.publicUrl
  }

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
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full bg-muted/40">
          <Image
            src={resolveStorageUrl(maestro.photo_url) || "/placeholder.svg"}
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
      <SiteFooter />
    </main>
  )
}

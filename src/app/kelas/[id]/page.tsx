import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export const revalidate = 30

async function getClassById(id: string) {
  const { data, error } = await supabase
    .from("v_classes")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const cls = await getClassById(id)

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

  if (!cls) {
    // Fallback to dummy detail if coming from dummy list item (for screenshots)
    if (id.startsWith("dummy-")) {
      const data = {
        id,
        title: `Kelas Dummy ${id.replace("dummy-", "")}`,
        description: "Deskripsi detail kelas dummy untuk keperluan pratinjau.",
        category: "Umum",
        thumbnail_url: "/placeholder.svg",
        maestro_name: "Maestro Dummy",
        maestro_region: "Nusantara",
      }
      return (
        <main>
          <SiteNavbar />
          <section className="mx-auto max-w-6xl px-4 py-8">
            <nav className="text-sm text-muted-foreground"><Link href="/kelas" className="hover:underline">Kelas</Link> <span className="mx-1">/</span> <span className="text-foreground">{data.title}</span></nav>
            <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="grid items-stretch gap-0 md:grid-cols-2">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                  <Image src={data.thumbnail_url} alt={data.title} fill className="object-cover" sizes="(min-width: 1024px) 560px, 100vw" />
                </div>
                <div className="p-6 md:p-8">
                  <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">{data.category}</span>
                  <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">{data.title}</h1>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{data.description}</p>
                  <p className="mt-4 text-sm text-muted-foreground">Diajarkan oleh <span className="font-medium text-foreground">{data.maestro_name}</span> • {data.maestro_region}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild className="bg-primary text-primary-foreground hover:opacity-90"><Link href={`/daftar/${id}`}>Daftar</Link></Button>
                    <Button asChild variant="secondary"><Link href="/kelas">Kembali</Link></Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Halaman pratinjau dummy.</p>
                </div>
              </div>
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
          <p className="text-muted-foreground">Kelas tidak ditemukan.</p>
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link href="/kelas">Kembali ke daftar kelas</Link>
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
      <section className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-sm text-muted-foreground"><Link href="/kelas" className="hover:underline">Kelas</Link> <span className="mx-1">/</span> <span className="text-foreground">{cls.title}</span></nav>
        <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="grid items-stretch gap-0 md:grid-cols-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
              <Image
                src={resolveStorageUrl(cls.thumbnail_url) || "/placeholder.svg"}
                alt={cls.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 560px, 100vw"
              />
            </div>
            <div className="p-6 md:p-8">
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">{cls.category || "Umum"}</span>
              <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">{cls.title}</h1>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{cls.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">Diajarkan oleh <span className="font-medium text-foreground">{cls.maestro_name}</span>{cls.maestro_region ? ` • ${cls.maestro_region}` : ""}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-primary text-primary-foreground hover:opacity-90"><Link href={`/daftar/${cls.id}`}>Daftar</Link></Button>
                <Button asChild variant="secondary"><Link href="/kelas">Kembali</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

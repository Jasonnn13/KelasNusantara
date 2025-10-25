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

  const isDummy = !cls && id.startsWith("dummy-")
  const data = cls ?? {
    id,
    title: `Kelas Dummy ${id.replace("dummy-", "")}`,
    description: "Deskripsi singkat kelas dummy untuk keperluan pratinjau.",
    category: "Umum",
    thumbnail_url: "/placeholder.svg",
    maestro_name: "Maestro Dummy",
    maestro_region: "Nusantara",
  }

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted/40">
            <Image
              src={(data.thumbnail_url && !data.thumbnail_url.startsWith("/") && !data.thumbnail_url.startsWith("http")
                ? supabase.storage.from("media").getPublicUrl(data.thumbnail_url).data.publicUrl
                : data.thumbnail_url) || "/placeholder.svg"}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 560px, 100vw"
            />
          </div>
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{data.title}</h1>
            <p className="mt-2 text-muted-foreground">{data.category || "Umum"}</p>
            <p className="mt-4 text-pretty leading-relaxed">{data.description}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Diajarkan oleh <span className="font-medium">{data.maestro_name}</span>
              {data.maestro_region ? ` • ${data.maestro_region}` : ""}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Button className="bg-primary text-primary-foreground hover:opacity-90">Konfirmasi Daftar</Button>
              <Button asChild variant="secondary">
                <Link href={`/kelas/${id}`}>Lihat Detail Kelas</Link>
              </Button>
            </div>
            {isDummy && (
              <p className="mt-3 text-xs text-muted-foreground">Halaman pratinjau dummy.</p>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

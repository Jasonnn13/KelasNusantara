import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { EnrollButton } from "@/components/enroll-button"

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
  const cls = await getClassById(params.id)

  if (!cls) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Kelas tidak ditemukan.</p>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link href="/kelas">Kembali ke daftar kelas</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted/40">
          <Image
            src={cls.thumbnail_url || "/placeholder.svg"}
            alt={cls.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 560px, 100vw"
          />
        </div>
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{cls.title}</h1>
          <p className="mt-2 text-muted-foreground">{cls.category || "Umum"}</p>
          <p className="mt-4 text-pretty leading-relaxed">{cls.description}</p>
          <div className="mt-6 flex items-center gap-4">
            <EnrollButton classId={cls.id} />
            <p className="text-sm text-muted-foreground">
              Diajarkan oleh <span className="font-medium">{cls.maestro_name}</span>
              {cls.maestro_region ? ` • ${cls.maestro_region}` : ""}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

const DEFAULT_PRICE = 0

type CategoryOption = {
  id: number
  name: string
}

type LevelOption = "beginner" | "intermediate" | "advanced"

const LEVEL_OPTIONS: Array<{ value: LevelOption; label: string }> = [
  { value: "beginner", label: "Pemula" },
  { value: "intermediate", label: "Menengah" },
  { value: "advanced", label: "Lanjutan" },
]

export default function NewClassPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [isMaestro, setIsMaestro] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [price, setPrice] = useState<string>(DEFAULT_PRICE.toString())
  const [level, setLevel] = useState<LevelOption>("beginner")
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(async ({ data, error }) => {
        if (error || !data.user) {
          toast.error("Masuk sebagai maestro terlebih dahulu.")
          router.replace("/auth/sign-in?next=/kelas/new")
          return
        }

        const user = data.user
        setUserId(user.id)
        let role = typeof user.user_metadata?.role === "string" ? (user.user_metadata.role as string) : null

        if (!role) {
          const { data: profileRow, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()

          if (profileError) {
            toast.error("Tidak dapat memeriksa peran maestro.")
            return
          }

          role = profileRow?.role ?? null
        }

        if (role !== "maestro") {
          toast.error("Hanya maestro yang dapat membuat kelas.")
          router.replace("/maestro")
          return
        }

        setIsMaestro(true)
      })
      .finally(() => {
        setAuthChecking(false)
      })
  }, [router])

  useEffect(() => {
    if (!isMaestro) return
    supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Tidak dapat memuat kategori.")
          return
        }
        setCategories((data as CategoryOption[]) ?? [])
      })
  }, [isMaestro])

  const priceCents = useMemo(() => {
    const value = Number(price)
    if (Number.isNaN(value) || value < 0) return DEFAULT_PRICE
    return Math.round(value * 100)
  }, [price])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!userId) return

    if (!title.trim()) {
      toast.error("Judul kelas wajib diisi.")
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from("classes")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          maestro_id: userId,
          category_id: categoryId ? Number(categoryId) : null,
          thumbnail_url: thumbnailUrl.trim() || null,
          price_cents: priceCents,
          level,
          published: true,
        })
        .select("id")
        .single()

      if (error) throw error

      toast.success("Kelas berhasil dibuat.")
      router.replace(`/kelas/${data.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tidak dapat membuat kelas"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-3xl px-4 py-12">
        {authChecking ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
            <span className="h-12 w-12 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p>Memeriksa akses maestro…</p>
          </div>
        ) : isMaestro ? (
          <>
            <header className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Buat Kelas Baru</h1>
              <p className="text-sm text-muted-foreground">
                Lengkapi informasi kelas untuk dibagikan kepada murid Nusantara.
              </p>
            </header>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Judul Kelas
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Tari Saman untuk Pemula"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Deskripsi
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ceritakan poin utama yang akan dipelajari murid."
                  rows={5}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Kategori
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="thumbnail" className="text-sm font-medium text-foreground">
                  URL Thumbnail (opsional)
                </label>
                <Input
                  id="thumbnail"
                  value={thumbnailUrl}
                  onChange={(event) => setThumbnailUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-6">
                <div className="grid gap-2">
                  <label htmlFor="price" className="text-sm font-medium text-foreground">
                    Harga (IDR)
                  </label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="level" className="text-sm font-medium text-foreground">
                    Tingkat
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(event) => setLevel(event.target.value as LevelOption)}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    {LEVEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button asChild variant="outline">
                  <Link href="/maestro">Batal</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Menyimpan…" : "Terbitkan Kelas"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Hanya maestro yang dapat mengakses halaman ini.</p>
            <Button asChild>
              <Link href="/maestro">Kembali</Link>
            </Button>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}

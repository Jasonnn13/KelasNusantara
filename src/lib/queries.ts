import { supabase } from "@/lib/supabase"

export function normalizeStoragePath(path: string) {
  // Trim common accidental prefixes
  let p = path.replace(/^public\//, "").replace(/^\/?media\//, "")
  // Fix common seed mismatch: .jpg vs .png (our assets are .png)
  if (p.endsWith(".jpg")) p = p.replace(/\.jpg$/i, ".png")
  return p
}

export function resolveMediaUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith("http")) return path
  if (path.startsWith("/")) {
    // If a leading slash is used, assume it's a local public asset
    return path
  }
  // Treat as storage object path in 'media' bucket
  const objectPath = normalizeStoragePath(path)
  const { data } = supabase.storage.from("media").getPublicUrl(objectPath)
  return data.publicUrl
}

export type VClass = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  price_cents: number
  currency: string
  level: string
  published: boolean
  created_at: string
  maestro_id: string
  maestro_name: string | null
  maestro_region: string | null
  maestro_discipline: string | null
  maestro_photo_url: string | null
  category: string | null
  category_slug: string | null
}

export async function getFeaturedClasses(limit = 6) {
  const { data, error } = await supabase
    .from("v_classes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  const rows = (data as VClass[]) ?? []
  return rows.map((r) => ({
    ...r,
    thumbnail_url: resolveMediaUrl(r.thumbnail_url) as string | null,
    maestro_photo_url: resolveMediaUrl(r.maestro_photo_url) as string | null,
  }))
}

export type Maestro = {
  id: string
  display_name: string
  region: string | null
  discipline: string | null
  bio: string | null
  photo_url: string | null
}

export async function getMaestros(limit = 6) {
  const { data, error } = await supabase
    .from("maestros")
    .select("id, display_name, region, discipline, bio, photo_url")
    .order("display_name", { ascending: true })
    .limit(limit)

  if (error) throw error
  const rows = (data as Maestro[]) ?? []
  return rows.map((m) => ({ ...m, photo_url: resolveMediaUrl(m.photo_url) as string | null }))
}

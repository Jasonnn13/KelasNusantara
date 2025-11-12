import "server-only"

import { getServerSupabaseClient } from "@/lib/supabase-server"

const supabase = getServerSupabaseClient()

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
  const objectPath = normalizeStoragePath(path)
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return `/media/${objectPath}`
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/media/${objectPath}`
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

export async function getClassById(id: string) {
  const { data, error } = await supabase
    .from("v_classes")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  const record = data as VClass
  return {
    ...record,
    thumbnail_url: resolveMediaUrl(record.thumbnail_url),
    maestro_photo_url: resolveMediaUrl(record.maestro_photo_url),
  }
}

export async function getMaestroById(id: string) {
  const { data, error } = await supabase
    .from("maestros")
    .select("id, display_name, region, discipline, bio, photo_url")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  const record = data as Maestro
  return {
    ...record,
    photo_url: resolveMediaUrl(record.photo_url),
  }
}

export type MaestroClassSummary = Pick<
  VClass,
  "id" | "title" | "description" | "category" | "thumbnail_url" | "created_at"
>

export async function getClassesByMaestroId(maestroId: string, limit = 12) {
  const { data, error } = await supabase
    .from("v_classes")
    .select("id, title, description, category, thumbnail_url, created_at")
    .eq("maestro_id", maestroId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  const rows = (data as MaestroClassSummary[]) ?? []
  return rows.map((item) => ({
    ...item,
    thumbnail_url: resolveMediaUrl(item.thumbnail_url),
  }))
}

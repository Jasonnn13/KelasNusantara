/*
  Helper script to upload local images from /public to Supabase Storage 'media' bucket
  Usage (PowerShell):
    # Set env vars first (or use .env.local)
    $env:NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="xxxxx"; node .\scripts\upload-media.ts
*/

import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const client = createClient(supabaseUrl, anonKey)

const PUBLIC_DIR = path.resolve(process.cwd(), "public")
const FILES = [
  "tari-bali-legong.jpg",
  "gamelan-jawa-ensemble.jpg",
  "batik-tulis-workshop.jpg",
  "portrait-maestro-tari-bali.jpg",
  "portrait-maestro-gamelan-jawa.jpg",
]

async function main() {
  for (const name of FILES) {
    const p = path.join(PUBLIC_DIR, name)
    if (!fs.existsSync(p)) {
      console.warn("Skip missing:", name)
      continue
    }
    const file = await fs.promises.readFile(p)
    const { error } = await client.storage.from("media").upload(name, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: name.endsWith(".jpg") ? "image/jpeg" : undefined,
    })
    if (error) {
      console.error("Upload failed:", name, error.message)
    } else {
      console.log("Uploaded:", name)
    }
  }
}

main()
  .then(() => console.log("Done"))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

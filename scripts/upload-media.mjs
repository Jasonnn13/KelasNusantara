// Upload all images in /public to Supabase Storage bucket 'media'
// Usage: npm run upload:media
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !(service || anon)) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.')
  process.exit(1)
}
const supabase = createClient(url, service || anon)

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])

const files = (await fs.promises.readdir(PUBLIC_DIR))
  .filter((f) => exts.has(path.extname(f).toLowerCase()))

if (files.length === 0) {
  console.log('No images found in /public to upload.')
  process.exit(0)
}

for (const name of files) {
  const filePath = path.join(PUBLIC_DIR, name)
  const data = await fs.promises.readFile(filePath)
  const { error } = await supabase.storage.from('media').upload(name, data, {
    cacheControl: '3600',
    upsert: true,
    contentType: {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }[path.extname(name).toLowerCase()],
  })
  if (error) {
    console.error('Upload failed:', name, error.message)
  } else {
    const { data: pub } = supabase.storage.from('media').getPublicUrl(name)
    console.log('Uploaded:', name, '->', pub.publicUrl)
  }
}

console.log('Done uploading to media bucket.')

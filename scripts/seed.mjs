// Seed database using Supabase service role
// Usage: npm run seed
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE
if (!url || !service) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.')
  process.exit(1)
}

const supabase = createClient(url, service, { auth: { persistSession: false } })

const CATS = [
  { slug: 'tari-bali', name: 'Tari Bali' },
  { slug: 'gamelan', name: 'Gamelan' },
  { slug: 'batik', name: 'Batik' },
]

const MAESTROS = [
  {
    email: 'maestro1@example.com',
    display_name: 'Ibu Saras Dewi',
    full_name: 'Ibu Saras Dewi',
    region: 'Bali',
    discipline: 'Tari Legong',
    bio: 'Penari dan koreografer Legong.',
    photo_url: 'portrait-maestro-tari-bali.jpg',
    avatar_url: 'portrait-maestro-tari-bali.jpg',
  },
  {
    email: 'maestro2@example.com',
    display_name: 'Mas Rendra Sapto',
    full_name: 'Mas Rendra Sapto',
    region: 'Yogyakarta',
    discipline: 'Gamelan',
    bio: 'Pengrawit dan pengajar karawitan.',
    photo_url: 'portrait-maestro-gamelan-jawa.jpg',
    avatar_url: 'portrait-maestro-gamelan-jawa.jpg',
  },
]

const STUDENT = { email: 'student1@example.com', full_name: 'Siswa Satu' }

const CLASSES = [
  {
    title: 'Tari Legong',
    category_slug: 'tari-bali',
    maestro_email: 'maestro1@example.com',
    description: 'Pelajari teknik dasar, ekspresi, dan filosofi Tari Legong.',
    thumbnail_url: 'tari-bali-legong.jpg',
    price_cents: 150000,
    currency: 'IDR',
    level: 'beginner',
  },
  {
    title: 'Gamelan Jawa',
    category_slug: 'gamelan',
    maestro_email: 'maestro2@example.com',
    description: 'Memahami laras, gendhing, dan permainan instrumen inti gamelan.',
    thumbnail_url: 'gamelan-jawa-ensemble.jpg',
    price_cents: 200000,
    currency: 'IDR',
    level: 'beginner',
  },
  {
    title: 'Membatik Tulis',
    category_slug: 'batik',
    maestro_email: 'maestro1@example.com',
    description: 'Dari menggambar pola hingga pewarnaan — proses batik tulis lengkap.',
    thumbnail_url: 'batik-tulis-workshop.jpg',
    price_cents: 175000,
    currency: 'IDR',
    level: 'beginner',
  },
]

async function upsertCategories() {
  for (const c of CATS) {
    const { error } = await supabase.from('categories').upsert(c, { onConflict: 'slug' })
    if (error) throw error
  }
}

async function createAuthUser(email, fullName) {
  // Use Admin API to create a confirmed user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) throw error
  return data.user
}

async function upsertProfilesAndMaestros() {
  const maestroIdByEmail = new Map()
  for (const m of MAESTROS) {
    const user = await createAuthUser(m.email, m.full_name)
    maestroIdByEmail.set(m.email, user.id)

    const prof = { id: user.id, full_name: m.full_name, avatar_url: m.avatar_url, role: 'maestro' }
    let res = await supabase.from('profiles').upsert(prof)
    if (res.error) throw res.error

    const maestro = {
      id: user.id,
      display_name: m.display_name,
      region: m.region,
      discipline: m.discipline,
      bio: m.bio,
      photo_url: m.photo_url,
    }
    res = await supabase.from('maestros').upsert(maestro)
    if (res.error) throw res.error
  }

  const student = await createAuthUser(STUDENT.email, STUDENT.full_name)
  const { error } = await supabase.from('profiles').upsert({ id: student.id, full_name: STUDENT.full_name, role: 'student' })
  if (error) throw error

  return { maestroIdByEmail, studentId: student.id }
}

async function insertClasses(maestroIdByEmail) {
  for (const c of CLASSES) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', c.category_slug)
      .maybeSingle()
    const row = {
      title: c.title,
      category_id: cat?.id ?? null,
      maestro_id: maestroIdByEmail.get(c.maestro_email),
      description: c.description,
      thumbnail_url: c.thumbnail_url,
      price_cents: c.price_cents,
      currency: c.currency,
      level: c.level,
      published: true,
    }
    const { error } = await supabase.from('classes').insert(row).select('id').single()
    if (error && !String(error.message).includes('duplicate')) throw error
  }
}

async function insertEnrollmentAndReview(studentId) {
  const { data: cls } = await supabase.from('classes').select('id').order('created_at', { ascending: true }).limit(1)
  if (!cls?.[0]) return
  const class_id = cls[0].id
  await supabase.from('enrollments').upsert({ user_id: studentId, class_id, status: 'active' })
  await supabase.from('reviews').upsert({ user_id: studentId, class_id, rating: 5, comment: 'Kelasnya sangat jelas dan menyenangkan!' })
}

async function main() {
  await upsertCategories()
  const { maestroIdByEmail, studentId } = await upsertProfilesAndMaestros()
  await insertClasses(maestroIdByEmail)
  await insertEnrollmentAndReview(studentId)
  console.log('Seed complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

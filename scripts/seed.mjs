// Seed database using Supabase service role
// Usage: npm run seed
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE
if (!url || !service) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.')
  process.exit(1)
}

const supabase = createClient(url, service, { auth: { persistSession: false } })

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')

const CATEGORIES = [
  { slug: 'musik-angklung', name: 'Musik Angklung Sunda' },
  { slug: 'gamelan-jawa', name: 'Gamelan Jawa' },
  { slug: 'batik-tulis', name: 'Batik Tulis' },
  { slug: 'tari-legong', name: 'Tari Legong Bali' },
  { slug: 'tari-saman', name: 'Tari Saman Aceh' },
  { slug: 'wayang-kulit', name: 'Wayang Kulit' },
]

const MAESTROS = [
  {
    email: 'maestro.angklung@example.com',
    display_name: 'Kang Arman Angklung',
    full_name: 'Arman Pradana',
    region: 'Bandung, Jawa Barat',
    discipline: 'Musik Angklung Sunda',
    bio: 'Pengajar angklung yang fokus pada harmoni Sunda kontemporer.',
    photo_url: 'maestro-angklung.png',
    avatar_url: 'maestro-angklung.png',
  },
  {
    email: 'maestro.batik@example.com',
    display_name: 'Ibu Ratna Batik',
    full_name: 'Ratna Ayu Wibisono',
    region: 'Pekalongan, Jawa Tengah',
    discipline: 'Seni Batik Tulis',
    bio: 'Perajin batik generasi ketiga yang melestarikan motif pesisir.',
    photo_url: 'maestro-batik-tulis.png',
    avatar_url: 'portrait-maestro-batik-tulis.png',
  },
  {
    email: 'maestro.gamelan@example.com',
    display_name: 'Mas Rendra Gamelan',
    full_name: 'Rendra Sapto Aji',
    region: 'Yogyakarta, DI Yogyakarta',
    discipline: 'Karawitan Gamelan Jawa',
    bio: 'Pengrawit dan komponis yang aktif mengaransemen gendhing modern.',
    photo_url: 'maestro-gamelan-jawa.png',
    avatar_url: 'portrait-maestro-gamelan-jawa.png',
  },
  {
    email: 'maestro.legong@example.com',
    display_name: 'Ibu Saras Legong',
    full_name: 'Saras Dewi Laksmi',
    region: 'Gianyar, Bali',
    discipline: 'Tari Legong',
    bio: 'Penari dan koreografer Legong dengan pengalaman 20 tahun.',
    photo_url: 'maestro-tari-bali.png',
    avatar_url: 'portrait-maestro-tari-bali.png',
  },
  {
    email: 'maestro.saman@example.com',
    display_name: 'Bang Faisal Saman',
    full_name: 'Faisal Darmawan',
    region: 'Aceh Besar, Aceh',
    discipline: 'Tari Saman',
    bio: 'Pelatih Tari Saman dengan fokus pada teknik formasi Puruet.',
    photo_url: 'maestro-tari-saman.png',
    avatar_url: 'maestro-tari-saman.png',
  },
  {
    email: 'maestro.wayang@example.com',
    display_name: 'Dalang Joko',
    full_name: 'Joko Priyono',
    region: 'Solo, Jawa Tengah',
    discipline: 'Wayang Kulit',
    bio: 'Dalang yang memadukan pedalangan klasik dan multimedia.',
    photo_url: 'maestro-wayang-kulit.png',
    avatar_url: 'maestro-wayang-kulit.png',
  },
]

const CLASSES = [
  {
    title: 'Ansambel Angklung Sunda',
    category_slug: 'musik-angklung',
    maestro_email: 'maestro.angklung@example.com',
    description: 'Belajar harmoni dan dinamika ansambel dengan lagu-lagu Sunda kontemporer.',
    thumbnail_url: 'angklung-sunda.png',
    price_cents: 150000,
    level: 'beginner',
  },
  {
    title: 'Eksplorasi Batik Tulis Pesisir',
    category_slug: 'batik-tulis',
    maestro_email: 'maestro.batik@example.com',
    description: 'Pendalaman motif, pewarnaan alam, dan finishing batik tulis pesisir.',
    thumbnail_url: 'batik-tulis-workshop.png',
    price_cents: 180000,
    level: 'intermediate',
  },
  {
    title: 'Dasar-dasar Batik Tulis',
    category_slug: 'batik-tulis',
    maestro_email: 'maestro.batik@example.com',
    description: 'Sesi perkenalan proses batik dari membuat pola hingga pelorodan.',
    thumbnail_url: 'batik-tulis.png',
    price_cents: 140000,
    level: 'beginner',
  },
  {
    title: 'Gamelan Jawa untuk Pemula',
    category_slug: 'gamelan-jawa',
    maestro_email: 'maestro.gamelan@example.com',
    description: 'Memahami laras slendro dan pelog serta instrumen dasar gamelan.',
    thumbnail_url: 'gamelan-jawa.png',
    price_cents: 165000,
    level: 'beginner',
  },
  {
    title: 'Ansambel Gamelan Lanjutan',
    category_slug: 'gamelan-jawa',
    maestro_email: 'maestro.gamelan@example.com',
    description: 'Aransemen gendhing klasik dalam format ensambel modern.',
    thumbnail_url: 'gamelan-jawa-ensemble.png',
    price_cents: 210000,
    level: 'intermediate',
  },
  {
    title: 'Teknik Tari Legong Inti',
    category_slug: 'tari-legong',
    maestro_email: 'maestro.legong@example.com',
    description: 'Mengeksplorasi gerak tangan, mata, dan ekspresi khas Legong.',
    thumbnail_url: 'tari-bali-legong.png',
    price_cents: 190000,
    level: 'beginner',
  },
  {
    title: 'Ekspresi Tari Legong Lanjutan',
    category_slug: 'tari-legong',
    maestro_email: 'maestro.legong@example.com',
    description: 'Pendalaman koreografi klasik dengan penekanan pada ekspresi penari.',
    thumbnail_url: 'tari-bali-legong-dancer.png',
    price_cents: 230000,
    level: 'advanced',
  },
  {
    title: 'Sejarah dan Makna Tari Legong',
    category_slug: 'tari-legong',
    maestro_email: 'maestro.legong@example.com',
    description: 'Menelusuri asal-usul Legong serta simbolisme tiap ragam gerak.',
    thumbnail_url: 'tari-legong-bali.png',
    price_cents: 120000,
    level: 'beginner',
  },
  {
    title: 'Formasi Tari Saman',
    category_slug: 'tari-saman',
    maestro_email: 'maestro.saman@example.com',
    description: 'Berlatih formasi, tempo, dan gerak tangan Tari Saman Aceh.',
    thumbnail_url: 'tari-saman-aceh.png',
    price_cents: 175000,
    level: 'intermediate',
  },
  {
    title: 'Pertunjukan Wayang Kulit Modern',
    category_slug: 'wayang-kulit',
    maestro_email: 'maestro.wayang@example.com',
    description: 'Menggabungkan pedalangan klasik dengan tata cahaya dan multimedia.',
    thumbnail_url: 'wayang-kulit-performance.png',
    price_cents: 220000,
    level: 'advanced',
  },
  {
    title: 'Workshop Wayang Kulit',
    category_slug: 'wayang-kulit',
    maestro_email: 'maestro.wayang@example.com',
    description: 'Pengenalan karakter, suara, dan teknik sabetan wayang kulit.',
    thumbnail_url: 'wayang-kulit.png',
    price_cents: 160000,
    level: 'beginner',
  },
]

const STUDENTS = [
  {
    email: 'student.ayu@example.com',
    full_name: 'Ayu Rahmawati',
    avatar_url: 'logo.png',
    enrollments: ['Dasar-dasar Batik Tulis', 'Ansambel Angklung Sunda', 'Workshop Wayang Kulit'],
    favorites: ['Dasar-dasar Batik Tulis', 'Teknik Tari Legong Inti'],
    follows: ['maestro.batik@example.com', 'maestro.wayang@example.com'],
    reviews: [
      { classTitle: 'Dasar-dasar Batik Tulis', rating: 5, comment: 'Instruksinya detail dan mudah diikuti.' },
      { classTitle: 'Workshop Wayang Kulit', rating: 4, comment: 'Seru belajar karakter wayang dari dalang langsung.' },
    ],
  },
  {
    email: 'student.bima@example.com',
    full_name: 'Bima Nugraha',
    avatar_url: 'angklung-sunda.png',
    enrollments: ['Gamelan Jawa untuk Pemula', 'Formasi Tari Saman', 'Pertunjukan Wayang Kulit Modern'],
    favorites: ['Gamelan Jawa untuk Pemula', 'Formasi Tari Saman'],
    follows: ['maestro.gamelan@example.com', 'maestro.saman@example.com'],
    reviews: [
      { classTitle: 'Gamelan Jawa untuk Pemula', rating: 5, comment: 'Penjelasan larasnya sangat jelas dan praktis.' },
      { classTitle: 'Formasi Tari Saman', rating: 5, comment: 'Latihannya intens tapi menyenangkan.' },
    ],
  },
  {
    email: 'student.laras@example.com',
    full_name: 'Laras Pertiwi',
    avatar_url: 'tari-legong-bali.png',
    enrollments: ['Teknik Tari Legong Inti', 'Ekspresi Tari Legong Lanjutan', 'Ansambel Gamelan Lanjutan'],
    favorites: ['Ekspresi Tari Legong Lanjutan', 'Ansambel Gamelan Lanjutan'],
    follows: ['maestro.legong@example.com', 'maestro.gamelan@example.com'],
    reviews: [
      { classTitle: 'Ekspresi Tari Legong Lanjutan', rating: 5, comment: 'Koreografi menantang dengan bimbingan yang sabar.' },
    ],
  },
]

let assetLookup = new Map()

function collectAssetFilenames() {
  const files = new Set()

  for (const maestro of MAESTROS) {
    if (maestro.photo_url) files.add(maestro.photo_url)
    if (maestro.avatar_url) files.add(maestro.avatar_url)
  }

  for (const cls of CLASSES) {
    if (cls.thumbnail_url) files.add(cls.thumbnail_url)
  }

  for (const student of STUDENTS) {
    if (student.avatar_url) files.add(student.avatar_url)
  }

  return [...files]
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

async function ensureBucket(bucket = 'media') {
  const { data, error } = await supabase.storage.getBucket(bucket)
  if (data || !error) return

  if (error?.status === 404) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
    })
    if (createError && !createError.message?.includes('already exists')) {
      throw createError
    }
  } else if (error) {
    throw error
  }
}

async function uploadAssets(files) {
  const map = new Map()

  for (const filename of files) {
    const filePath = path.join(PUBLIC_DIR, filename)
    const buffer = await readFile(filePath)
    const storagePath = `seed/${filename}`
    const contentType = getContentType(filename)

    const { error } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        upsert: true,
        contentType,
        cacheControl: '86400',
      })

    if (error) throw error

    const { data } = supabase.storage.from('media').getPublicUrl(storagePath)
    map.set(filename, { storagePath, publicUrl: data.publicUrl })
  }

  return map
}

function resolveAsset(filename) {
  if (!filename) return null
  const record = assetLookup.get(filename)
  return record?.publicUrl ?? null
}

async function upsertCategories() {
  for (const category of CATEGORIES) {
    const { error } = await supabase.from('categories').upsert(category, { onConflict: 'slug' })
    if (error) throw error
  }

  const { data, error } = await supabase.from('categories').select('id, slug')
  if (error) throw error
  return new Map(data.map((row) => [row.slug, row.id]))
}

async function listUsersPage(page = 1, perPage = 1000) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
  if (error) throw error
  return data.users ?? []
}

async function findUserByEmail(email) {
  const normalized = email.toLowerCase()
  const users = await listUsersPage(1, 1000)
  return users.find((user) => user.email?.toLowerCase() === normalized) ?? null
}

async function getOrCreateUser(email, fullName) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (!error) return data.user

  if (error.status === 422 || String(error.message).toLowerCase().includes('registered') || String(error.message).toLowerCase().includes('duplicate')) {
    const existing = await findUserByEmail(email)
    if (!existing) throw error
    await supabase.auth.admin.updateUserById(existing.id, {
      user_metadata: { ...existing.user_metadata, full_name: fullName },
    })
    return existing
  }

  throw error
}

async function upsertProfilesAndMaestros() {
  const maestroIdByEmail = new Map()

  for (const maestro of MAESTROS) {
    const user = await getOrCreateUser(maestro.email, maestro.full_name)
    maestroIdByEmail.set(maestro.email, user.id)

    const avatarUrl = resolveAsset(maestro.avatar_url) ?? maestro.avatar_url ?? null
    const photoUrl = resolveAsset(maestro.photo_url) ?? maestro.photo_url ?? null

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: maestro.full_name,
        avatar_url: avatarUrl,
        role: 'maestro',
      },
      { onConflict: 'id' }
    )
    if (profileError) throw profileError

    const { error: maestroError } = await supabase.from('maestros').upsert(
      {
        id: user.id,
        display_name: maestro.display_name,
        region: maestro.region,
        discipline: maestro.discipline,
        bio: maestro.bio,
        photo_url: photoUrl,
      },
      { onConflict: 'id' }
    )
    if (maestroError) throw maestroError
  }

  return maestroIdByEmail
}

async function upsertStudents() {
  const studentIdByEmail = new Map()

  for (const student of STUDENTS) {
    const user = await getOrCreateUser(student.email, student.full_name)
    studentIdByEmail.set(student.email, user.id)

    const avatarUrl = resolveAsset(student.avatar_url) ?? student.avatar_url ?? null

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: student.full_name,
        avatar_url: avatarUrl,
        role: 'student',
      },
      { onConflict: 'id' }
    )
    if (error) throw error
  }

  return studentIdByEmail
}

async function upsertClasses(maestroIdByEmail, categoryIdBySlug) {
  const classIdByTitle = new Map()

  for (const cls of CLASSES) {
    const maestroId = maestroIdByEmail.get(cls.maestro_email)
    if (!maestroId) {
      throw new Error(`Missing maestro id for ${cls.maestro_email}`)
    }

    const categoryId = categoryIdBySlug.get(cls.category_slug) ?? null

    const thumbnailUrl = resolveAsset(cls.thumbnail_url) ?? cls.thumbnail_url ?? null

    const payload = {
      title: cls.title,
      category_id: categoryId,
      maestro_id: maestroId,
      description: cls.description,
      thumbnail_url: thumbnailUrl,
      price_cents: cls.price_cents,
      currency: 'IDR',
      level: cls.level,
      published: true,
    }

    const existing = await supabase.from('classes').select('id').eq('title', cls.title).maybeSingle()
    if (existing.error && existing.error.code !== 'PGRST116') {
      throw existing.error
    }

    if (existing.data) {
      const { error } = await supabase.from('classes').update(payload).eq('id', existing.data.id)
      if (error) throw error
      classIdByTitle.set(cls.title, existing.data.id)
    } else {
      const { data, error } = await supabase.from('classes').insert(payload).select('id').single()
      if (error) throw error
      classIdByTitle.set(cls.title, data.id)
    }
  }

  return classIdByTitle
}

async function seedStudentEngagement(studentIdByEmail, classIdByTitle, maestroIdByEmail) {
  for (const student of STUDENTS) {
    const studentId = studentIdByEmail.get(student.email)
    if (!studentId) continue

    for (const title of student.enrollments ?? []) {
      const classId = classIdByTitle.get(title)
      if (!classId) continue
      const { error } = await supabase
        .from('enrollments')
        .upsert({ user_id: studentId, class_id: classId, status: 'active' }, { onConflict: 'user_id,class_id' })
      if (error) throw error
    }

    for (const title of student.favorites ?? []) {
      const classId = classIdByTitle.get(title)
      if (!classId) continue
      const { error } = await supabase
        .from('favorites')
        .upsert({ user_id: studentId, class_id: classId }, { onConflict: 'user_id,class_id' })
      if (error) throw error
    }

    for (const maestroEmail of student.follows ?? []) {
      const maestroId = maestroIdByEmail.get(maestroEmail)
      if (!maestroId) continue
      const { error } = await supabase
        .from('follows_maestros')
        .upsert({ user_id: studentId, maestro_id: maestroId }, { onConflict: 'user_id,maestro_id' })
      if (error) throw error
    }

    for (const review of student.reviews ?? []) {
      const classId = classIdByTitle.get(review.classTitle)
      if (!classId) continue
      const { error } = await supabase
        .from('reviews')
        .upsert(
          {
            user_id: studentId,
            class_id: classId,
            rating: review.rating,
            comment: review.comment,
          },
          { onConflict: 'user_id,class_id' }
        )
      if (error) throw error
    }
  }
}

async function main() {
  console.log('Ensuring media bucket...')
  await ensureBucket('media')

  console.log('Uploading public assets to storage...')
  assetLookup = await uploadAssets(collectAssetFilenames())

  console.log('Seeding categories...')
  const categoryIdBySlug = await upsertCategories()

  console.log('Seeding maestros...')
  const maestroIdByEmail = await upsertProfilesAndMaestros()

  console.log('Seeding students...')
  const studentIdByEmail = await upsertStudents()

  console.log('Seeding classes...')
  const classIdByTitle = await upsertClasses(maestroIdByEmail, categoryIdBySlug)

  console.log('Seeding enrollments, favorites, follows, and reviews...')
  await seedStudentEngagement(studentIdByEmail, classIdByTitle, maestroIdByEmail)

  console.log('Seed complete with updated dummy data.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

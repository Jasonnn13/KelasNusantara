import { Music, Sparkles, Users, MapPin } from "lucide-react"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const values = [
  {
    title: "Pelestarian Bernilai",
    description:
      "Kami menjaga tradisi Nusantara tetap hidup melalui praktik langsung dan dokumentasi yang rapi.",
    icon: Sparkles,
  },
  {
    title: "Keadilan Maestro",
    description:
      "Maestro menerima kompensasi layak dan dukungan produksi agar bisa fokus pada proses berkarya.",
    icon: Users,
  },
  {
    title: "Belajar Tanpa Batas",
    description:
      "Pelajar dapat mengakses kelas dari mana saja melalui format yang humanis dan mudah diikuti.",
    icon: MapPin,
  },
]

const journey = [
  {
    year: "2023",
    title: "Mulai dari Kampung",
    body: "Program pilot kami dimulai dengan tiga maestro di Yogyakarta, Bandung, dan Makassar.",
  },
  {
    year: "2024",
    title: "Meluas ke Nusantara",
    body: "Kami merangkul lebih dari 40 maestro dan menayangkan 120 sesi kelas lintas disiplin.",
  },
  {
    year: "2025",
    title: "Gerakan Kolaborasi",
    body:
      "Kelas Nusantara berkolaborasi dengan komunitas seni, sekolah, dan pemerintah daerah untuk memperkuat ekosistem budaya.",
  },
]

const stats = [
  { label: "Maestro aktif", value: "48" },
  { label: "Murid", value: "3.2K" },
  { label: "Kota", value: "22" },
]

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      <SiteNavbar />
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-48 right-0 h-96 w-96 rounded-full bg-amber-200 opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 left-[-10%] h-72 w-72 rounded-full bg-rose-200 opacity-40 blur-3xl" />

        <section className="relative mx-auto flex max-w-5xl flex-col gap-12 px-4 py-16 sm:py-20">
          <div className="grid gap-10 rounded-3xl border border-amber-100 bg-white/70 p-8 shadow-xl shadow-amber-100/40 backdrop-blur md:grid-cols-[1.5fr_1fr]">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-600">Tentang kami</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                Merawat warisan budaya melalui pembelajaran yang hangat dan bermakna
              </h1>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-stone-600">
                Kelas Nusantara mempertemukan maestro dengan murid lintas kota untuk belajar seni tradisional secara
                langsung. Kami memadukan teknologi yang ramah dengan sentuhan personal agar budaya terlestarikan tanpa
                kehilangan ruhnya.
              </p>
            </header>
            <div className="flex flex-col justify-between gap-6 rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-white p-6">
              <div>
                <h2 className="text-xl font-semibold text-amber-900">Tujuan inti</h2>
                <p className="mt-3 text-sm leading-relaxed text-amber-800">
                  Kami membangun jaringan agar maestro tidak hanya mengajar, tetapi juga didampingi, terdokumentasi, dan
                  dihargai secara finansial.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-amber-200 bg-white/80 p-4 text-center shadow-sm">
                    <p className="text-2xl font-semibold text-stone-900">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wide text-stone-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="grid gap-6 md:grid-cols-3">
            {values.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="border-none bg-white/80 shadow-lg shadow-amber-100/50">
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-3 text-amber-600">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-stone-900">{title}</CardTitle>
                    <CardDescription className="mt-1 text-sm text-stone-600">{description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-xl shadow-stone-200/50">
            <div className="flex items-center gap-3 text-stone-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                <Music className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Perjalanan kami</p>
                <h2 className="text-xl font-semibold text-stone-900">Gelombang kecil yang tumbuh menjadi gerakan</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[320px_1fr] md:gap-12">
              <p className="text-pretty text-base leading-relaxed text-stone-600">
                Kami percaya setiap generasi berhak merasakan hangatnya belajar langsung dari maestro. Perjalanan ini
                dimulai dari ruang komunitas kecil dan berkembang melalui dukungan para seniman, murid, dan organisasi
                budaya yang memiliki visi serupa.
              </p>
              <div className="relative">
                <span className="absolute left-[10px] top-0 h-full w-px bg-gradient-to-b from-amber-400 via-amber-200 to-transparent" />
                <div className="space-y-8">
                  {journey.map((step) => (
                    <div key={step.year} className="relative pl-10">
                      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border border-amber-500 bg-white" />
                      <p className="text-xs uppercase tracking-wide text-amber-600">{step.year}</p>
                      <h3 className="text-lg font-semibold text-stone-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-500 via-amber-400 to-rose-400 p-[1px] shadow-2xl">
            <div className="grid gap-6 rounded-[calc(theme(borderRadius.3xl)-1px)] bg-white/95 px-8 py-10 text-stone-800 md:grid-cols-[2fr_1fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-500">Mari bekerja sama</p>
                <h2 className="mt-4 text-3xl font-semibold text-stone-900">Buka ruang belajar baru untuk budaya daerahmu</h2>
                <p className="mt-4 text-base leading-relaxed text-stone-600">
                  Kami terbuka untuk kolaborasi dengan komunitas, sekolah, organisasi, maupun sponsor yang ingin memberi
                  panggung pada maestro lokal. Mari wujudkan pengalaman belajar yang berakar pada kearifan Nusantara.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-sm leading-relaxed text-amber-900 shadow-inner">
                <p className="font-semibold text-amber-800">Hubungi kami</p>
                <p className="mt-2">Email: kontak@kelas-nusantara.example</p>
                <p className="mt-2">Whatsapp: +62 812-3456-7890</p>
                <p className="mt-2 text-xs text-amber-700/80">
                  Tim kami akan membalas dalam satu hari kerja dan membantu merancang program berbasis kebutuhanmu.
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
      <SiteFooter />
    </main>
  )
}

import { ClassCard } from "@/components/class-card"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export default function KelasPage() {
  const classes = [
    {
      title: "Tari Legong",
      category: "Tari Bali",
      description: "Teknik dasar, ekspresi, dan filosofi gerak Legong.",
      imageUrl: "/tari-legong-bali.png",
    },
    {
      title: "Gamelan Jawa Dasar",
      category: "Musik Tradisional",
      description: "Pengenalan laras, gendhing, dan instrumen inti.",
      imageUrl: "/gamelan-jawa.png",
    },
    {
      title: "Batik Tulis",
      category: "Kriya",
      description: "Dari menggambar pola hingga pewarnaan alam.",
      imageUrl: "/batik-tulis.png",
    },
    {
      title: "Wayang Kulit",
      category: "Pertunjukan",
      description: "Dasar pedalangan dan pengenalan tokoh-tokoh.",
      imageUrl: "/wayang-kulit.png",
    },
    {
      title: "Angklung",
      category: "Musik Sunda",
      description: "Belajar koordinasi dan harmoni menggunakan angklung.",
      imageUrl: "/angklung-sunda.png",
    },
    {
      title: "Saman",
      category: "Tari Aceh",
      description: "Ketukan, formasi, dan kekompakan gerak.",
      imageUrl: "/tari-saman-aceh.png",
    },
  ]

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Semua Kelas</h1>
        <p className="mt-2 text-muted-foreground">Pilih kelas favoritmu dari seluruh Nusantara.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard key={c.title} {...c} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

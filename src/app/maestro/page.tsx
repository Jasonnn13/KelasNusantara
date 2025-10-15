import { MaestroCard } from "@/components/maestro-card"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MaestroPage() {
  const maestros = [
    {
      name: "Ibu Saras Dewi",
      region: "Bali",
      discipline: "Tari Legong",
      bio: "Koreografer dan penari Legong berpengalaman.",
      imageUrl: "/maestro-tari-bali.png",
    },
    {
      name: "Mas Rendra Sapto",
      region: "Yogyakarta",
      discipline: "Gamelan",
      bio: "Pengrawit dan pengajar karawitan di berbagai sanggar.",
      imageUrl: "/maestro-gamelan-jawa.png",
    },
    {
      name: "Bu Ningsih",
      region: "Pekalongan",
      discipline: "Batik Tulis",
      bio: "Perajin batik turun-temurun, spesialis motif klasik.",
      imageUrl: "/maestro-batik-tulis.png",
    },
    {
      name: "Pak Bagus Arya",
      region: "Bali",
      discipline: "Wayang Kulit",
      bio: "Dalang dengan fokus penyajian lakon klasik.",
      imageUrl: "/maestro-wayang-kulit.png",
    },
    {
      name: "Teh Rani",
      region: "Bandung",
      discipline: "Angklung",
      bio: "Pelatih ansambel angklung komunitas dan sekolah.",
      imageUrl: "/maestro-angklung.png",
    },
    {
      name: "Ust. Fajar",
      region: "Aceh",
      discipline: "Tari Saman",
      bio: "Pelatih Saman yang menekankan kekompakan dan disiplin.",
      imageUrl: "/maestro-tari-saman.png",
    },
  ]

  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Maestro Nusantara</h1>
            <p className="mt-2 text-muted-foreground">
              Kenali para maestro yang menjaga dan mengajarkan warisan budaya kita.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
            <Link href="/maestro">Ajukan Diri sebagai Maestro</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maestros.map((m) => (
            <MaestroCard key={m.name} {...m} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

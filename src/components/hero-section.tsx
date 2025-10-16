import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16 lg:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Belajar Seni Tradisional Indonesia dari Para Maestro
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Kelas Nusantara menghubungkan pelajar dengan maestro tari, gamelan, batik, dan berbagai seni leluhur. Dukung
            pelestarian budaya sambil belajar langsung do and how&apos;s-nya.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
              <Link href="/kelas">Mulai Belajar</Link>
            </Button>
            <Button asChild variant="secondary" className="bg-secondary text-secondary-foreground hover:opacity-90">
              <Link href="/maestro">Ajukan Kelas sebagai Maestro</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3">
            <image
              src="/tari-bali-legong-dancer.png"
              alt="Penari Legong Bali"
              className="h-40 w-full rounded-md object-cover"
            />
            <image
              src="/gamelan-jawa-ensemble.png"
              alt="Ansambel Gamelan Jawa"
              className="h-40 w-full rounded-md object-cover"
            />
            <image
              src="/batik-tulis-workshop.png"
              alt="Proses Batik Tulis"
              className="h-40 w-full rounded-md object-cover"
            />
            <image
              src="/wayang-kulit-performance.png"
              alt="Pertunjukan Wayang Kulit"
              className="h-40 w-full rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const heroGallery = [
  { src: "/tari-bali-legong-dancer.png", alt: "Penari Legong Bali", priority: true },
  { src: "/gamelan-jawa-ensemble.png", alt: "Ansambel Gamelan Jawa" },
  { src: "/batik-tulis-workshop.png", alt: "Proses Batik Tulis" },
  { src: "/wayang-kulit-performance.png", alt: "Pertunjukan Wayang Kulit" },
]

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
            pelestarian budaya sambil belajar langsung ddari maestronya!
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
            {heroGallery.map(({ src, alt, priority }) => (
              <figure key={src} className="relative h-40 w-full overflow-hidden rounded-md bg-muted/40">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority={Boolean(priority)}
                  sizes="(min-width: 1024px) 280px, (min-width: 768px) 45vw, 50vw"
                  className="object-cover"
                  loading={priority ? "eager" : "lazy"}
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

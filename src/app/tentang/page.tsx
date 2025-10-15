import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

export default function TentangPage() {
  return (
    <main>
      <SiteNavbar />
      <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Tentang Kelas Nusantara</h1>
        <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
          Kelas Nusantara adalah platform pembelajaran seni tradisional Indonesia yang menghubungkan pelajar dengan
          maestro-maestro terbaik. Misi kami adalah melestarikan budaya melalui praktik langsung, kompensasi yang adil
          bagi pengajar, dan pengalaman belajar yang bermakna.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">Nilai Kami</h2>
            <ul className="mt-3 list-disc pl-5 text-muted-foreground">
              <li>Pelestarian budaya sebagai prioritas</li>
              <li>Keadilan bagi maestro</li>
              <li>Akses belajar untuk semua</li>
            </ul>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">Cara Kerja</h2>
            <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
              <li>Maestro membuat kelas</li>
              <li>Murid mendaftar dan belajar</li>
              <li>Budaya tersebar, maestro sejahtera</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 rounded-lg border p-5">
          <h2 className="text-lg font-semibold">Kontak</h2>
          <p className="mt-2 text-muted-foreground">
            Ingin bermitra atau bertanya? Kirim pesan ke kontak@kelas-nusantara.example
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

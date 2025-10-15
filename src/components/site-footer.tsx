import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
        <div>
          <p className="font-semibold">Kelas Nusantara</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Melestarikan budaya melalui pembelajaran yang adil bagi maestro dan bermakna bagi murid.
          </p>
        </div>
        <div>
          <p className="font-semibold">Jelajahi</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="#" className="hover:text-primary">
                Semua Kelas
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Jadi Maestro
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Tentang Kami
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Kontak</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <a href="mailto:hello@kelasnusantara.id" className="hover:text-primary">
                hello@kelasnusantara.id
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kelas Nusantara. Semua hak dilindungi.
      </div>
    </footer>
  )
}

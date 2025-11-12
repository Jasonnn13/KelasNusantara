import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ClassCardProps = {
  id: string
  title: string
  category: string
  description: string
  imageUrl: string
}

export function ClassCard({ id, title, category, description, imageUrl }: ClassCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl shadow-sm gap-0 p-0">
      <Link href={`/kelas/${id}`} className="flex flex-1 flex-col">
        <div className="relative w-full overflow-hidden aspect-[4/3]">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={`${title} - ilustrasi`}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            className="object-cover object-center"
            priority={false}
          />
          <div className="absolute inset-0 rounded-t-[inherit] ring-1 ring-inset ring-border/40" aria-hidden="true" />
        </div>
        <CardHeader className="flex-1 border-t border-border/60 px-6 pt-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-xs">{category}</CardDescription>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="line-clamp-2 text-sm text-muted-foreground sm:max-w-[70%]">{description}</p>
        <Button
          asChild
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:opacity-90 sm:w-auto"
        >
          <Link href={`/daftar/${id}`}>Daftar</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

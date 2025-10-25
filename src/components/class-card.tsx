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
    <Card className="overflow-hidden">
      <Link href={`/kelas/${id}`} className="block">
        <div className="relative h-40 w-full overflow-hidden bg-muted/40">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={`${title} - ilustrasi`}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-xs">{category}</CardDescription>
        </CardHeader>
      </Link>
      <CardContent className="flex items-center justify-between">
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
          <Link href={`/daftar/${id}`}>Daftar</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

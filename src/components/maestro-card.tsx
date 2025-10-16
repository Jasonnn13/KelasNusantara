import Image from "next/image"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type MaestroCardProps = {
  name: string
  region: string
  discipline: string
  bio: string
  imageUrl: string
}

export function MaestroCard({ name, region, discipline, bio, imageUrl }: MaestroCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted/40">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={`${name} - ${discipline}`}
            fill
            sizes="64px"
            className="object-cover"
            priority={false}
          />
        </div>
        <div>
          <CardTitle className="text-base">{name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {discipline} • {region}
          </p>
        </div>
      </div>
      <CardContent className="pt-0">
        <p className="line-clamp-3 text-sm text-muted-foreground">{bio}</p>
        <div className="mt-4">
          <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90">
            Ikuti Maestro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

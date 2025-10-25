import Image from "next/image"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { FollowButton } from "./follow-button"

type MaestroCardProps = {
  id: string
  name: string
  region: string
  discipline: string
  bio: string
  imageUrl: string
}

export function MaestroCard({ id, name, region, discipline, bio, imageUrl }: MaestroCardProps) {
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
          <FollowButton maestroId={id} />
        </div>
      </CardContent>
    </Card>
  )
}

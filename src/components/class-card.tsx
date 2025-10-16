import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ClassCardProps = {
  title: string
  category: string
  description: string
  imageUrl: string
}

export function ClassCard({ title, category, description, imageUrl }: ClassCardProps) {
  return (
    <Card className="overflow-hidden">
      <image
        src={imageUrl || "/placeholder.svg"}
        alt={`${title} - ilustrasi`}
        className="h-40 w-full object-cover"
        crossOrigin="anonymous"
      />
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-xs">{category}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
          Daftar
        </Button>
      </CardContent>
    </Card>
  )
}

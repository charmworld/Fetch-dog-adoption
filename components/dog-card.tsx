"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar } from "lucide-react"
import Image from "next/image"

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

interface DogCardProps {
  dog: Dog
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function DogCard({ dog, isFavorite, onToggleFavorite }: DogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={dog.img || "/placeholder.svg"}
          alt={dog.name}
          width={400}
          height={300}
          className="w-full h-64 object-cover"
        />
        <Button
          variant={isFavorite ? "default" : "secondary"}
          size="sm"
          className="absolute top-3 right-3"
          onClick={onToggleFavorite}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{dog.name}</h3>
          <Badge variant="outline">{dog.breed}</Badge>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {dog.age} {dog.age === 1 ? "year" : "years"} old
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {dog.zip_code}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

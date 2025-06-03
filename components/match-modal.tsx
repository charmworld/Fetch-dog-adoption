"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, Sparkles } from "lucide-react"
import Image from "next/image"

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

interface MatchModalProps {
  dog: Dog
  isOpen: boolean
  onClose: () => void
}

export default function MatchModal({ dog, isOpen, onClose }: MatchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            It's a Match!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <div className="relative">
            <Image
              src={dog.img || "/placeholder.svg"}
              alt={dog.name}
              width={300}
              height={300}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-center items-center space-x-2">
              <h2 className="text-2xl font-bold">{dog.name}</h2>
              <Heart className="w-6 h-6 text-red-500 fill-current" />
            </div>

            <Badge variant="secondary" className="text-lg px-3 py-1">
              {dog.breed}
            </Badge>

            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {dog.age} {dog.age === 1 ? "year" : "years"} old
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {dog.zip_code}
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              Congratulations! Based on your favorites, we think {dog.name} would be perfect for you. This adorable{" "}
              {dog.breed.toLowerCase()} is ready to find their forever home!
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep Browsing
            </Button>
            <Button className="flex-1">Contact Shelter</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

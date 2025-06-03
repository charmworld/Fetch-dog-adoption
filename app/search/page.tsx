"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, LogOut, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import DogCard from "@/components/dog-card"
import MatchModal from "@/components/match-modal"

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

interface SearchResponse {
  resultIds: string[]
  total: number
  next?: string
  prev?: string
}

export default function SearchPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [breeds, setBreeds] = useState<string[]>([])
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [ageMin, setAgeMin] = useState("")
  const [ageMax, setAgeMax] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchBreeds()
    searchDogs()
  }, [])

  const fetchBreeds = async () => {
    try {
      const response = await fetch("https://frontend-take-home-service.fetch.com/dogs/breeds", {
        credentials: "include",
      })
      if (response.ok) {
        const breedsData = await response.json()
        setBreeds(breedsData)
      }
    } catch (error) {
      console.error("Failed to fetch breeds:", error)
    }
  }

  const searchDogs = async (from?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (selectedBreeds.length > 0) {
        selectedBreeds.forEach((breed) => params.append("breeds", breed))
      }
      if (ageMin) params.append("ageMin", ageMin)
      if (ageMax) params.append("ageMax", ageMax)
      if (zipCode) params.append("zipCodes", zipCode)
      if (from) params.append("from", from)

      params.append("sort", `breed:${sortOrder}`)
      params.append("size", "25")

      const response = await fetch(`https://frontend-take-home-service.fetch.com/dogs/search?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const searchData: SearchResponse = await response.json()
        setSearchResults(searchData)

        if (searchData.resultIds.length > 0) {
          const dogsResponse = await fetch("https://frontend-take-home-service.fetch.com/dogs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(searchData.resultIds),
          })

          if (dogsResponse.ok) {
            const dogsData = await dogsResponse.json()
            setDogs(dogsData)
          }
        } else {
          setDogs([])
        }
      } else if (response.status === 401) {
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search for dogs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBreedChange = (breed: string, checked: boolean) => {
    if (checked) {
      setSelectedBreeds([...selectedBreeds, breed])
    } else {
      setSelectedBreeds(selectedBreeds.filter((b) => b !== breed))
    }
  }

  const toggleFavorite = (dogId: string) => {
    if (favorites.includes(dogId)) {
      setFavorites(favorites.filter((id) => id !== dogId))
    } else {
      setFavorites([...favorites, dogId])
    }
  }

  const generateMatch = async () => {
    if (favorites.length === 0) {
      toast({
        title: "No Favorites Selected",
        description: "Please add some dogs to your favorites first!",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("https://frontend-take-home-service.fetch.com/dogs/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(favorites),
      })

      if (response.ok) {
        const matchData = await response.json()
        const matchedDogData = dogs.find((dog) => dog.id === matchData.match)
        if (matchedDogData) {
          setMatchedDog(matchedDogData)
          setShowMatchModal(true)
        }
      }
    } catch (error) {
      toast({
        title: "Match Failed",
        description: "Unable to generate a match. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("https://frontend-take-home-service.fetch.com/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      router.push("/")
    }
  }

  const handleNextPage = () => {
    if (searchResults?.next) {
      const url = new URL(searchResults.next, "https://frontend-take-home-service.fetch.com")
      const from = url.searchParams.get("from")
      if (from) {
        searchDogs(from)
        setCurrentPage(currentPage + 1)
      }
    }
  }

  const handlePrevPage = () => {
    if (searchResults?.prev) {
      const url = new URL(searchResults.prev, "https://frontend-take-home-service.fetch.com")
      const from = url.searchParams.get("from")
      searchDogs(from || undefined)
      setCurrentPage(Math.max(0, currentPage - 1))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Dog</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {favorites.length} Favorites
              </Badge>
              <Button onClick={generateMatch} disabled={favorites.length === 0}>
                <Sparkles className="w-4 h-4 mr-2" />
                Find My Match
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <div className="flex space-x-2">
                    <Input placeholder="Min" type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                    <Input placeholder="Max" type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                  </div>
                </div>

                {/* Zip Code */}
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input placeholder="Enter zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <Label>Sort by Breed</Label>
                  <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">A to Z</SelectItem>
                      <SelectItem value="desc">Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Breeds */}
                <div className="space-y-2">
                  <Label>Breeds</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {breeds.map((breed) => (
                      <div key={breed} className="flex items-center space-x-2">
                        <Checkbox
                          id={breed}
                          checked={selectedBreeds.includes(breed)}
                          onCheckedChange={(checked) => handleBreedChange(breed, checked as boolean)}
                        />
                        <Label htmlFor={breed} className="text-sm font-normal">
                          {breed}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => searchDogs()} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search Dogs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {searchResults ? `${searchResults.total} dogs found` : "Loading..."}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handlePrevPage} disabled={!searchResults?.prev}>
                  Previous
                </Button>
                <Button variant="outline" onClick={handleNextPage} disabled={!searchResults?.next}>
                  Next
                </Button>
              </div>
            </div>

            {/* Dog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : dogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {dogs.map((dog) => (
                  <DogCard
                    key={dog.id}
                    dog={dog}
                    isFavorite={favorites.includes(dog.id)}
                    onToggleFavorite={() => toggleFavorite(dog.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No dogs found matching your criteria.</div>
                <div className="text-gray-400 text-sm mt-2">Try adjusting your filters and search again.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {matchedDog && <MatchModal dog={matchedDog} isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} />}
    </div>
  )
}

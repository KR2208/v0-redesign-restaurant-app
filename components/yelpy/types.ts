export interface Restaurant {
  id: string
  name: string
  address: string
  rating: number
  priceLevel: number
  types: string[]
  lat: number
  lng: number
  photoUrl?: string
}

export interface AIRecommendation {
  name: string
  description: string
  reason: string
}

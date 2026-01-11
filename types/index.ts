export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  type: 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'sports' | 'motorcycle'
  price: number
  location: string
  images: string[]
  description: string
  features: string[]
  available: boolean
  ownerId: string
  ownerName: string
  rating: number
  reviewCount: number
  mileage?: number
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  transmission?: 'automatic' | 'manual'
  seats?: number
  createdAt: string
}

export interface Booking {
  id: string
  vehicleId: string
  vehicle: Vehicle
  userId: string
  startDate: string
  endDate: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'buyer' | 'seller' | 'both'
  phone?: string
  avatar?: string
  createdAt: string
}

export interface Review {
  id: string
  vehicleId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}


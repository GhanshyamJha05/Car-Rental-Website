export interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  type: 'sedan' | 'suv' | 'truck' | 'van' | 'luxury' | 'sports' | 'motorcycle' | 'convertible'
  pricePerDay: number
  price?: number // for compatibility during migration
  location: {
    type: string
    coordinates: [number, number]
    address: {
      city: string
      state?: string
      country?: string
      fullAddress: string
    }
  }
  images: string[]
  description: string
  features: string[]
  availability: boolean
  isApproved: boolean
  vendor: string | User
  createdAt: string
  updatedAt: string
}

export interface Booking {
  _id: string
  car: string | Vehicle
  user: string | User
  vendor: string | User
  startDate: string
  endDate: string
  days: number
  pricePerDay: number
  subtotal: number
  platformCommission: number
  vendorEarnings: number
  total: number
  status: 'PENDING' | 'PAID' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'USER' | 'VENDOR' | 'ADMIN'
  phone?: string
  isVendorApproved?: boolean
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


import { create } from 'zustand'
import { User, Vehicle, Booking } from '@/types'

interface AppState {
  user: User | null
  vehicles: Vehicle[]
  bookings: Booking[]
  setUser: (user: User | null) => void
  addVehicle: (vehicle: Vehicle) => void
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, booking: Partial<Booking>) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  vehicles: [],
  bookings: [],
  setUser: (user) => set({ user }),
  addVehicle: (vehicle) => set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
  updateVehicle: (id, updates) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  deleteVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.id !== id)
  })),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
}))


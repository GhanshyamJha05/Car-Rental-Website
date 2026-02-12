import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Vehicle, Booking } from '@/types'

interface AppState {
  user: User | null
  vehicles: Vehicle[]
  bookings: Booking[]
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setVehicles: (vehicles: Vehicle[]) => void
  setBookings: (bookings: Booking[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  addVehicle: (vehicle: Vehicle) => void
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void

  addBooking: (booking: Booking) => void
  updateBooking: (id: string, booking: Partial<Booking>) => void

  logout: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      vehicles: [],
      bookings: [],
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setVehicles: (vehicles) => set({ vehicles }),
      setBookings: (bookings) => set({ bookings }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      addVehicle: (vehicle) => set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
      updateVehicle: (id, updates) => set((state) => ({
        vehicles: state.vehicles.map(v => v._id === id ? { ...v, ...updates } : v)
      })),
      deleteVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter(v => v._id !== id)
      })),

      addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
      updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map(b => b._id === id ? { ...b, ...updates } : b)
      })),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ user: null, bookings: [], vehicles: [] });
      }
    }),
    {
      name: 'rental-web-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user for now
    }
  )
)


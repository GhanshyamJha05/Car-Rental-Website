'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiDollarSign, FiPackage, FiSettings, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import { useStore } from '@/store/useStore'
import { bookingsApi, carsApi } from '@/lib/api'
import { Booking, Vehicle } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, bookings, setBookings, vehicles, setVehicles, deleteVehicle } = useStore()
  const [activeTab, setActiveTab] = useState<'bookings' | 'listings'>('bookings')
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch bookings
        const bookingsRes = await bookingsApi.getUserBookings()
        if (bookingsRes.success && bookingsRes.data) {
          setBookings(bookingsRes.data as any)
        }

        // Fetch vendor listings if applicable
        if (user.role === 'VENDOR') {
          const carsRes = await carsApi.getVendorCars()
          if (carsRes.success && carsRes.data) {
            setUserVehicles(carsRes.data as any)
            setVehicles(carsRes.data as any)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router, setBookings, setVehicles])

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const myBookings = bookings
  const isVendor = user.role === 'VENDOR' || user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dashboard</h1>
          <p className="text-xl text-primary-100">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Bookings</div>
                <div className="text-3xl font-bold text-gray-900">{myBookings.length}</div>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          {isVendor && (
            <>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Active Listings</div>
                    <div className="text-3xl font-bold text-gray-900">{userVehicles.length}</div>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Estimated Earnings</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${userVehicles.reduce((sum, v) => sum + (v.pricePerDay || 0) * 5, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'bookings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                My Bookings
              </button>
              {isVendor && (
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'listings'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  My Listings
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                {myBookings.length > 0 ? (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven&apos;t made any bookings yet.</p>
                    <Link
                      href="/vehicles"
                      className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Browse Vehicles
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && isVendor && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Vehicle Listings</h2>
                  <Link
                    href="/vehicles?action=list"
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Add Vehicle</span>
                  </Link>
                </div>
                {userVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userVehicles.map((vehicle) => (
                      <VehicleListingCard
                        key={vehicle._id}
                        vehicle={vehicle}
                        onDelete={() => deleteVehicle(vehicle._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven&apos;t listed any vehicles yet.</p>
                    <Link
                      href="/vehicles?action=list"
                      className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      List Your First Vehicle
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const car = booking.car as Vehicle
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <Link href={`/vehicles/${car?._id}`} className="flex-shrink-0">
          <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-200">
            {car?.images?.[0] ? (
              <Image
                src={car.images[0]}
                alt={car.make + ' ' + car.model}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 200px"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link
                href={`/vehicles/${car?._id}`}
                className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
              >
                {car?.make} {car?.model} {car?.year}
              </Link>
              <p className="text-gray-500 text-sm mt-1">{car?.location?.address?.city}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">Start Date</div>
              <div className="font-semibold text-gray-900">
                {new Date(booking.startDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">End Date</div>
              <div className="font-semibold text-gray-900">
                {new Date(booking.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-500">Total Price</div>
              <div className="text-2xl font-bold text-gray-900">${booking.total}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VehicleListingCard({ vehicle, onDelete }: { vehicle: Vehicle; onDelete: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/vehicles/${vehicle._id}`}>
        <div className="relative h-48 bg-gray-200">
          {vehicle.images?.[0] ? (
            <Image
              src={vehicle.images[0]}
              alt={vehicle.make + ' ' + vehicle.model}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/vehicles/${vehicle._id}`}>
          <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </h3>
        </Link>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">${vehicle.pricePerDay}</div>
            <div className="text-sm text-gray-500">per day</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${vehicle.availability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
            {vehicle.availability ? 'Available' : 'Rented'}
          </span>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/vehicles/${vehicle._id}/edit`}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiEdit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

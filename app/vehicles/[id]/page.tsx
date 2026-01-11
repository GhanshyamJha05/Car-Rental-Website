'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiStar, FiMapPin, FiUsers, FiCalendar, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { mockVehicles } from '@/lib/mockData'
import { Vehicle } from '@/types'
import { useStore } from '@/store/useStore'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, addBooking } = useStore()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    const foundVehicle = mockVehicles.find(v => v.id === params.id)
    setVehicle(foundVehicle || null)
  }, [params.id])

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle not found</h2>
          <button
            onClick={() => router.push('/vehicles')}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    )
  }

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays || 1
    }
    return 1
  }

  const calculateTotal = () => {
    return vehicle.price * calculateDays()
  }

  const handleBook = () => {
    if (!user) {
      router.push('/auth/login?redirect=/vehicles/' + vehicle.id)
      return
    }

    if (!startDate || !endDate) {
      alert('Please select start and end dates')
      return
    }

    const booking = {
      id: Date.now().toString(),
      vehicleId: vehicle.id,
      vehicle,
      userId: user.id,
      startDate,
      endDate,
      totalPrice: calculateTotal(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    addBooking(booking)
    setShowBookingModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-96 md:h-[500px] bg-gray-200">
                <Image
                  src={vehicle.images[selectedImageIndex]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
              {vehicle.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-4">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-primary-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 200px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiMapPin className="w-5 h-5" />
                      <span>{vehicle.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{vehicle.rating}</span>
                      <span>({vehicle.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <div className="text-4xl font-bold text-gray-900">${vehicle.price}</div>
                  <div className="text-gray-500">per day</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FiCheck className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {vehicle.mileage && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicle.mileage && (
                      <div>
                        <div className="text-sm text-gray-500">Mileage</div>
                        <div className="text-lg font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} mi</div>
                      </div>
                    )}
                    {vehicle.fuelType && (
                      <div>
                        <div className="text-sm text-gray-500">Fuel Type</div>
                        <div className="text-lg font-semibold text-gray-900 capitalize">{vehicle.fuelType}</div>
                      </div>
                    )}
                    {vehicle.transmission && (
                      <div>
                        <div className="text-sm text-gray-500">Transmission</div>
                        <div className="text-lg font-semibold text-gray-900 capitalize">{vehicle.transmission}</div>
                      </div>
                    )}
                    {vehicle.seats && (
                      <div>
                        <div className="text-sm text-gray-500">Seats</div>
                        <div className="text-lg font-semibold text-gray-900">{vehicle.seats}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Vehicle</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {startDate && endDate && (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>${vehicle.price} × {calculateDays()} days</span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-4"
                >
                  {user ? 'Book Now' : 'Sign In to Book'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiCheck className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold mb-1">Free cancellation</div>
                    <div className="text-gray-600">Cancel up to 24 hours before pickup</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your booking request has been submitted. The owner will confirm shortly.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowBookingModal(false)
                    router.push('/dashboard')
                  }}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  View Bookings
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


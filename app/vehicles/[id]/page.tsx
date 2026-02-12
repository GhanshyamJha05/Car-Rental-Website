'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiStar, FiMapPin, FiUsers, FiCalendar, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { carsApi, bookingsApi, paymentsApi } from '@/lib/api'
import { Vehicle, Booking } from '@/types'
import { useStore } from '@/store/useStore'

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useStore()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true)
      try {
        const response = await carsApi.getById(params.id as string)
        if (response.success && response.data) {
          setVehicle(response.data as any)
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchVehicle()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

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
    return (vehicle.pricePerDay || 0) * calculateDays()
  }

  const handleBook = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/vehicles/${vehicle._id}`)
      return
    }

    if (!startDate || !endDate) {
      setError('Please select start and end dates')
      return
    }

    setIsBooking(true)
    setError('')

    try {
      const bookingRes = await bookingsApi.create({
        car: vehicle._id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      })

      if (bookingRes.success && bookingRes.data) {
        const booking = bookingRes.data as Booking

        // Create payment session
        const protocol = window.location.protocol
        const host = window.location.host
        const baseUrl = `${protocol}//${host}`

        const paymentRes = await paymentsApi.createSession({
          bookingId: booking._id,
          successUrl: `${baseUrl}/dashboard?booking=success`,
          cancelUrl: `${baseUrl}/vehicles/${vehicle._id}?booking=cancelled`,
        })

        if (paymentRes.success && paymentRes.data?.url) {
          window.location.href = paymentRes.data.url
        } else {
          router.push('/dashboard?booking=pending')
        }
      } else {
        setError(bookingRes.message || 'Failed to create booking')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking')
    } finally {
      setIsBooking(false)
    }
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
                {vehicle.images[selectedImageIndex] ? (
                  <Image
                    src={vehicle.images[selectedImageIndex]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 font-bold">No Image Available</div>
                )}
              </div>
              {vehicle.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-4">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
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
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-capitalize">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiMapPin className="w-5 h-5" />
                      <span>{vehicle.location?.address?.city}, {vehicle.location?.address?.state}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <div className="text-4xl font-bold text-gray-900">${vehicle.pricePerDay}</div>
                  <div className="text-gray-500">per day</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicle.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FiCheck className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Vehicle</h2>

              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                    {error}
                  </div>
                )}

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {startDate && endDate && (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>${vehicle.pricePerDay} × {calculateDays()} days</span>
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
                  disabled={isBooking || !vehicle.availability}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : !vehicle.availability ? (
                    'Not Available'
                  ) : user ? (
                    'Book & Pay Now'
                  ) : (
                    'Sign In to Book'
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-900">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiCheck className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Instant Confirmation</div>
                    <div className="text-gray-600">Secure your booking instantly with Stripe</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

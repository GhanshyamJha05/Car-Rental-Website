'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi'

export default function Hero() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    
    setTimeout(() => {
      router.push(`/vehicles?${params.toString()}`)
      setIsSearching(false)
    }, 300)
  }

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  return (
    <section className="relative min-h-[90vh] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-primary-200 to-white bg-clip-text text-transparent">
                Rental Vehicle
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Discover thousands of premium vehicles. From compact cars to luxury SUVs, find exactly what you need for your next adventure.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Location */}
                <div className="md:col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2 text-left">
                    <FiMapPin className="inline w-4 h-4 mr-1 text-primary-600" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City or Zip"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Start Date */}
                <div className="md:col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2 text-left">
                    <FiCalendar className="inline w-4 h-4 mr-1 text-primary-600" />
                    Pick-up
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* End Date */}
                <div className="md:col-span-1">
                  <label className="block text-gray-700 text-sm font-semibold mb-2 text-left">
                    <FiCalendar className="inline w-4 h-4 mr-1 text-primary-600" />
                    Drop-off
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || tomorrow}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Search Button */}
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="button-primary w-full flex items-center justify-center space-x-2 text-lg py-4"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <FiSearch className="w-5 h-5" />
                        <span>Search</span>
                        <FiArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-12 text-primary-100 animate-fade-in">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">10K+</div>
              <div className="text-sm md:text-base">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">50K+</div>
              <div className="text-sm md:text-base">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">100+</div>
              <div className="text-sm md:text-base">Cities Worldwide</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

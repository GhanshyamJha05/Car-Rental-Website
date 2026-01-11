'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiStar, FiMapPin, FiUsers, FiFilter, FiSliders } from 'react-icons/fi'
import { mockVehicles } from '@/lib/mockData'
import { Vehicle } from '@/types'

function VehiclesContent() {
  const searchParams = useSearchParams()
  const [vehicles] = useState<Vehicle[]>(mockVehicles)
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(mockVehicles)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [searchLocation, setSearchLocation] = useState('')
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    let filtered = [...vehicles]

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(v => v.type === selectedType)
    }

    // Filter by price
    filtered = filtered.filter(v => v.price >= priceRange[0] && v.price <= priceRange[1])

    // Filter by location
    if (searchLocation) {
      filtered = filtered.filter(v => 
        v.location.toLowerCase().includes(searchLocation.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    setFilteredVehicles(filtered)
  }, [selectedType, priceRange, searchLocation, sortBy, vehicles])

  const vehicleTypes = ['all', 'sedan', 'suv', 'truck', 'van', 'luxury', 'sports', 'motorcycle']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Vehicles</h1>
          <p className="text-xl text-primary-100">Find your perfect rental vehicle</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FiFilter className="w-5 h-5 mr-2" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Vehicle Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Vehicle Type
                </label>
                <div className="space-y-2">
                  {vehicleTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={selectedType === type}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}/day
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-700">
                <span className="font-semibold">{filteredVehicles.length}</span> vehicles found
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiSliders className="w-5 h-5" />
                  <span>Filters</span>
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Vehicle Cards */}
            {filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No vehicles found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedType('all')
                    setPriceRange([0, 500])
                    setSearchLocation('')
                  }}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 block"
    >
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">{vehicle.rating}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-gray-500 text-sm">{vehicle.year}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">${vehicle.price}</div>
            <div className="text-sm text-gray-500">per day</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <FiMapPin className="w-4 h-4" />
            <span>{vehicle.location}</span>
          </div>
          {vehicle.seats && (
            <div className="flex items-center space-x-1">
              <FiUsers className="w-4 h-4" />
              <span>{vehicle.seats} seats</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {vehicle.features.slice(0, 2).map((feature, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    }>
      <VehiclesContent />
    </Suspense>
  )
}

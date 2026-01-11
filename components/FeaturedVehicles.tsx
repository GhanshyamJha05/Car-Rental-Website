'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiStar, FiMapPin, FiUsers, FiArrowRight } from 'react-icons/fi'
import { mockVehicles } from '@/lib/mockData'
import { Vehicle } from '@/types'

export default function FeaturedVehicles() {
  const featuredVehicles = mockVehicles.slice(0, 6)

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Featured Vehicles
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl">
              Hand-picked premium selections for the best rental experience
            </p>
          </div>
          <Link
            href="/vehicles"
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-lg group transition-colors"
          >
            <span>View All</span>
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredVehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>

        <div className="text-center mt-12 md:hidden">
          <Link
            href="/vehicles"
            className="button-primary inline-flex items-center space-x-2"
          >
            <span>View All Vehicles</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-medium hover:shadow-large transition-all duration-300 border border-gray-100 card-hover"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center space-x-1.5 shadow-lg">
          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-gray-900">{vehicle.rating}</span>
        </div>
        
        {/* Type Badge */}
        {vehicle.type === 'luxury' && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            ⭐ Premium
          </div>
        )}
        {vehicle.fuelType === 'electric' && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            ⚡ Electric
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-gray-500 text-sm">{vehicle.year} • {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}</p>
          </div>
          <div className="text-right ml-4">
            <div className="text-3xl font-extrabold text-gray-900">
              ${vehicle.price}
            </div>
            <div className="text-xs text-gray-500 font-medium">per day</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-1.5">
            <FiMapPin className="w-4 h-4 text-primary-600" />
            <span className="font-medium">{vehicle.location}</span>
          </div>
          {vehicle.seats && (
            <div className="flex items-center space-x-1.5">
              <FiUsers className="w-4 h-4 text-primary-600" />
              <span className="font-medium">{vehicle.seats} seats</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {vehicle.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full font-medium border border-primary-100"
            >
              {feature}
            </span>
          ))}
          {vehicle.features.length > 3 && (
            <span className="text-xs text-gray-500 px-3 py-1.5 font-medium">
              +{vehicle.features.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

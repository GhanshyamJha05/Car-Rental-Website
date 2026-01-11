import Link from 'next/link'
import { FiNavigation, FiTruck, FiShield, FiZap } from 'react-icons/fi'

const categories = [
  { name: 'Sedan', icon: FiNavigation, count: '1,234', href: '/vehicles?type=sedan' },
  { name: 'SUV', icon: FiTruck, count: '856', href: '/vehicles?type=suv' },
  { name: 'Luxury', icon: FiShield, count: '342', href: '/vehicles?type=luxury' },
  { name: 'Electric', icon: FiZap, count: '567', href: '/vehicles?type=electric' },
]

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find the perfect vehicle type for your needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 group-hover:bg-primary-600 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.count} vehicles
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}


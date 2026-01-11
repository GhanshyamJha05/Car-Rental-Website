import Hero from '@/components/Hero'
import FeaturedVehicles from '@/components/FeaturedVehicles'
import HowItWorks from '@/components/HowItWorks'
import Categories from '@/components/Categories'

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <Categories />
      <FeaturedVehicles />
      <HowItWorks />
    </div>
  )
}


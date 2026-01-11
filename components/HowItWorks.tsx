import { FiSearch, FiFileText, FiCheckCircle } from 'react-icons/fi'

const steps = [
  {
    icon: FiSearch,
    title: 'Search & Browse',
    description: 'Find the perfect vehicle from thousands of listings in your area',
    step: '01',
  },
  {
    icon: FiFileText,
    title: 'Book & Pay',
    description: 'Secure your booking with our easy payment system',
    step: '02',
  },
  {
    icon: FiCheckCircle,
    title: 'Enjoy Your Ride',
    description: 'Pick up your vehicle and hit the road with confidence',
    step: '03',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-primary-200 transform translate-x-1/2 -translate-y-1/2 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full"></div>
                  </div>
                )}

                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
                    <Icon className="w-10 h-10 text-primary-600" />
                  </div>
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary-50">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


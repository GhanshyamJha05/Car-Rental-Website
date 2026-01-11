'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiPhone, FiSave, FiLogOut } from 'react-icons/fi'
import { useStore } from '@/store/useStore'

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser } = useStore()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/profile')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleLogout = () => {
    setUser(null)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Profile Settings</h1>
          <p className="text-xl text-primary-100">Manage your account information</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user.name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiMail className="inline w-4 h-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiPhone className="inline w-4 h-4 mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  defaultValue={user.phone || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <FiSave className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


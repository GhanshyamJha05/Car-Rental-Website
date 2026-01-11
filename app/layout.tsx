import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RentalWeb - Vehicle Rental Platform',
    template: '%s | RentalWeb',
  },
  description: 'Discover and rent premium vehicles from trusted owners. List your vehicle and earn extra income. Find your perfect rental car, SUV, truck, or luxury vehicle today.',
  keywords: ['vehicle rental', 'car rental', 'rent a car', 'vehicle sharing', 'car sharing', 'rental platform'],
  authors: [{ name: 'RentalWeb' }],
  creator: 'RentalWeb',
  publisher: 'RentalWeb',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'RentalWeb',
    title: 'RentalWeb - Vehicle Rental Platform',
    description: 'Discover and rent premium vehicles from trusted owners. List your vehicle and earn extra income.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RentalWeb - Vehicle Rental Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentalWeb - Vehicle Rental Platform',
    description: 'Discover and rent premium vehicles from trusted owners.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}


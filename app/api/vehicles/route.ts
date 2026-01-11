import { NextRequest, NextResponse } from 'next/server'
import { mockVehicles } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  const location = searchParams.get('location')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  let vehicles = [...mockVehicles]

  // Filter by type
  if (type && type !== 'all') {
    vehicles = vehicles.filter(v => v.type === type)
  }

  // Filter by location
  if (location) {
    vehicles = vehicles.filter(v =>
      v.location.toLowerCase().includes(location.toLowerCase())
    )
  }

  // Filter by price range
  if (minPrice) {
    vehicles = vehicles.filter(v => v.price >= parseInt(minPrice))
  }
  if (maxPrice) {
    vehicles = vehicles.filter(v => v.price <= parseInt(maxPrice))
  }

  return NextResponse.json(vehicles)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real app, validate and save to database
    const newVehicle = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newVehicle, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    )
  }
}


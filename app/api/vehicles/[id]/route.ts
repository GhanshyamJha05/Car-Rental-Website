import { NextRequest, NextResponse } from 'next/server'
import { mockVehicles } from '@/lib/mockData'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vehicle = mockVehicles.find(v => v.id === params.id)

  if (!vehicle) {
    return NextResponse.json(
      { error: 'Vehicle not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(vehicle)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const vehicle = mockVehicles.find(v => v.id === params.id)

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // In a real app, update in database
    const updatedVehicle = { ...vehicle, ...body }

    return NextResponse.json(updatedVehicle)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vehicle = mockVehicles.find(v => v.id === params.id)

  if (!vehicle) {
    return NextResponse.json(
      { error: 'Vehicle not found' },
      { status: 404 }
    )
  }

  // In a real app, delete from database
  return NextResponse.json({ message: 'Vehicle deleted' })
}


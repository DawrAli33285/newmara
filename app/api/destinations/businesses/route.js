import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { id } = params

    const destination = await prisma.destination.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found.' }, { status: 404 })
    }

    const businesses = await prisma.businessProfile.findMany({
      where: { destinationId: id },
      select: {
        id: true,
        businessName: true,
        logoUrl: true,
        category: true,
        location: true,
        galleryUrls: true,
      },
      orderBy: { businessName: 'asc' },
    })

    return NextResponse.json({ businesses })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
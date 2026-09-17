import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { businessId: session.user.id },
      select: { id: true },
    })

    if (!businessProfile) {
      return NextResponse.json({ error: 'No business profile found.' }, { status: 404 })
    }

    const offers = await prisma.offer.findMany({
      where: { businessProfileId: businessProfile.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ offers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
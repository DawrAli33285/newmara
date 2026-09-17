import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('business-session-token')?.value
    if (!token) {
      return NextResponse.json({ hasPlan: false })
    }

    const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET })
    if (!decoded?.id) {
      return NextResponse.json({ hasPlan: false })
    }

    const business = await prisma.business.findUnique({
      where: { id: decoded.id },
      select: {
        advertiser: { select: { id: true } },
        directoryListings: { select: { id: true }, take: 1 },
        businessProfile: {
          select: { digitalPartner: { select: { id: true } } },
        },
      },
    })

    if (!business) {
      return NextResponse.json({ hasPlan: false })
    }

    const hasPlan = Boolean(
      business.advertiser ||
      business.businessProfile?.digitalPartner ||
      business.directoryListings.length > 0
    )

    return NextResponse.json({ hasPlan })
  } catch (err) {
    return NextResponse.json({ hasPlan: false })
  }
}
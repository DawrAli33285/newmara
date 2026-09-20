import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.accountType !== 'business') {
      return NextResponse.json({ business: null })
    }

    const business = await prisma.business.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        businessName: true,
        advertiser: { select: { id: true } },
        directoryListings: { select: { id: true }, take: 1 },
        businessProfile: {
          select: {
            digitalPartner: { select: { id: true, package: { select: { packageType: true } } } },
          },
        },
        assignments: {
          where: { status: 'active' },
          select: { publicationId: true, destinationId: true },
        },
      },
    })

    if (!business) {
      return NextResponse.json({ business: null })
    }

    let existingPackageType = null
    if (business.advertiser) {
      existingPackageType = 'advertiser'
    } else if (business.businessProfile?.digitalPartner) {
      existingPackageType = business.businessProfile.digitalPartner.package?.packageType || 'digital_partner'
    } else if (business.directoryListings.length > 0) {
      existingPackageType = 'directory_listing'
    }

    const existingPublicationIds = [...new Set(business.assignments.map((a) => a.publicationId))]
    const existingDestinationIds = [...new Set(business.assignments.map((a) => a.destinationId))]

    return NextResponse.json({
      business: {
        id: business.id,
        email: business.email,
        businessName: business.businessName,
        existingPackageType,
        existingPublicationIds,
        existingDestinationIds,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ business: null })
  }
}
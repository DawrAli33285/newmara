import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'



export async function GET(req, { params }) {
  try {
    const { id } = await params

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { id },
      select: {
        id: true,
        logoUrl: true,
        description: true,
        location: true,
        mapUrl: true,
        website: true,
        telephone: true,
        socialLinks: true,
        galleryUrls: true,
        promoVideoUrl: true,
        ctaText: true,
        ctaUrl: true,
        destination: true,
        business: {
          select: {
            businessName: true,
            category: true,
            email: true,
          },
        },
        digitalPartner: {
          select: {
            package: { select: { name: true } },
          },
        },
        offers: {
          where: {
            status: 'live',
            expiryDate: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        },
        featuredPlacements: {
          where: {
            placementType: 'featured_business',
            startDate: { lte: new Date() },
            OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
          },
        },
      },
    })
  
      if (!businessProfile) {
        return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
      }
  
      return NextResponse.json({ businessProfile })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
  }
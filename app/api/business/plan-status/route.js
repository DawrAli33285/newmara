import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.accountType !== 'business') {
      return NextResponse.json({ hasPlan: false })
    }

    const business = await prisma.business.findUnique({
      where: { id: session.user.id },
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


    const hasDigitalPartner = Boolean(business.businessProfile?.digitalPartner)
    const hasAdvertiser = Boolean(business.advertiser)
    const hasDirectoryListing = business.directoryListings.length > 0

    let hasPlan = hasDigitalPartner || hasAdvertiser || hasDirectoryListing

    let planType = null
    if (hasDigitalPartner) {
      planType = hasAdvertiser ? 'digital_partner_advertiser' : 'digital_partner'
    } else if (hasAdvertiser) {
      planType = 'advertiser'
    } else if (hasDirectoryListing) {
      planType = 'directory_listing'
    }

    if (!hasPlan) {
      try {
        const activeSubscription = await prisma.businessSubscription.findFirst({
          where: {
            businessId: session.user.id,
            status: { in: ['active', 'trialing', 'past_due'] },
          },
          orderBy: { createdAt: 'desc' },
        })

        if (activeSubscription) {
          hasPlan = true
          planType = activeSubscription.packageType
        }
      } catch (subErr) {
        console.error('plan-status subscription fallback error:', subErr)
      }
    }

    let isSubscriptionActive = true
    try {
      const latestSubscription = await prisma.businessSubscription.findFirst({
        where: { businessId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })

      if (latestSubscription && latestSubscription.status === 'cancelled') {
        isSubscriptionActive = false
      }
    } catch (subErr) {
      console.error('plan-status active-check error:', subErr)
    }

    return NextResponse.json({ hasPlan, planType, isSubscriptionActive })
    
    // const hasDigitalPartner = Boolean(business.businessProfile?.digitalPartner)
    // const hasAdvertiser = Boolean(business.advertiser)
    // const hasDirectoryListing = business.directoryListings.length > 0

    // let hasPlan = hasDigitalPartner || hasAdvertiser || hasDirectoryListing

    // let planType = null
    // if (hasDigitalPartner) {
    //   planType = hasAdvertiser ? 'digital_partner_advertiser' : 'digital_partner'
    // } else if (hasAdvertiser) {
    //   planType = 'advertiser'
    // } else if (hasDirectoryListing) {
    //   planType = 'directory_listing'
    // }

    // if (!hasPlan) {
    //   try {
    //     const activeSubscription = await prisma.businessSubscription.findFirst({
    //       where: {
    //         businessId: session.user.id,
    //         status: { in: ['active', 'trialing', 'past_due'] },
    //       },
    //       orderBy: { createdAt: 'desc' },
    //     })

    //     if (activeSubscription) {
    //       hasPlan = true
    //       planType = activeSubscription.packageType
    //     }
    //   } catch (subErr) {
    //     console.error('plan-status subscription fallback error:', subErr)
    //   }
    // }

    // return NextResponse.json({ hasPlan, planType })
  } catch (err) {
    console.error('plan-status error:', err)
    return NextResponse.json({ hasPlan: false, planType: null })
  }
}
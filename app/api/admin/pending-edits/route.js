
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'
    const page   = parseInt(searchParams.get('page') || '1', 10)
    const limit  = 10
    const skip   = (page - 1) * limit
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const offerStatus = status === 'pending' ? 'submitted' : status
    const directoryEditStatus = status === 'pending' ? 'submitted' : status

    const [profileEdits, offers, directoryEdits, totalProfileEdits, totalOffers, totalDirectoryEdits] = await Promise.all([
      prisma.businessProfileEdit.findMany({
        where: { status },
        include: {
          businessProfile: {
            select: {
              id: true,
              logoUrl: true,
              business: {
                select: {
                  businessName: true,
                  email: true,
                  category: { select: { name: true, slug: true } },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.offer.findMany({
        where: { status: offerStatus },
        include: {
          businessProfile: {
            select: {
              id: true,
              logoUrl: true,
              business: {
                select: {
                  businessName: true,
                  email: true,
                  category: { select: { name: true, slug: true } },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.directoryListingEdit.findMany({
        where: { status: directoryEditStatus },
        include: {
          directoryListing: {
            select: {
              id: true,
              businessName: true,
              business: {
                select: {
                  businessName: true,
                  email: true,
                  category: { select: { name: true, slug: true } },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.businessProfileEdit.count({ where: { status } }),
      prisma.offer.count({ where: { status: offerStatus } }),
      prisma.directoryListingEdit.count({ where: { status: directoryEditStatus } }),
    ])

    const queue = [
      ...profileEdits.map((e) => ({ type: 'profile_edit', ...e })),
      ...offers.map((o) => ({ type: 'offer', ...o })),
      ...directoryEdits.map((d) => ({ type: 'directory_listing_edit', ...d })),
    ].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))

    const total      = totalProfileEdits + totalOffers + totalDirectoryEdits
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ queue, count: total, page, totalPages, limit })
    
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const paymentStatus = searchParams.get('paymentStatus')

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

    const where = paymentStatus
      ? { printBookings: { some: { paymentStatus } } }
      : undefined

    const [advertisers, totalCount] = await Promise.all([
      prisma.advertiser.findMany({
        where,
        include: {
          business: {
            select: { businessName: true, email: true, category: true },
          },
          printBookings: {
            include: {
              publication: { select: { title: true } },
              package: { select: { name: true } },
            },
            orderBy: { startDate: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.advertiser.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    return NextResponse.json({ advertisers, totalCount, totalPages, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const status          = searchParams.get('status')
  const publicationId  = searchParams.get('publicationId')
  const search           = searchParams.get('search')

  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

  const where = {}
  if (status)          where.status = status
  if (publicationId)  where.publicationId = publicationId
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { businessProfile: { business: { businessName: { contains: search, mode: 'insensitive' } } } },
    ]
  }

  const [enquiries, totalCount, failedCount] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      include: {
        businessProfile: { include: { business: true } },
        publication: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.enquiry.count({ where }),
    prisma.enquiry.count({ where: { status: 'failed' } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return NextResponse.json({ enquiries, totalCount, totalPages, page, pageSize, failedCount })
}
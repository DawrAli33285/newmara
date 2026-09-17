import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const isActive = searchParams.get('isActive')

  const where = {}
  if (isActive === 'true') where.isActive = true
  if (isActive === 'false') where.isActive = false

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

  const [digitalPartners, totalCount] = await Promise.all([
    prisma.digitalPartner.findMany({
      where,
      include: {
        businessProfile: {
          include: {
            business: true,
          },
        },
        package: true,
        publications: {
          include: {
            publication: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.digitalPartner.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return NextResponse.json({ digitalPartners, totalCount, totalPages, page, pageSize })
}
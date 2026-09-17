import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const where = search
    ? {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const businesses = await prisma.business.findMany({
    where,
    select: {
      id: true,
      businessName: true,
      email: true,
      category: { select: { id: true, name: true } },
    },
    orderBy: { businessName: 'asc' },
    take: 50,
  })

  return NextResponse.json({ businesses })
}
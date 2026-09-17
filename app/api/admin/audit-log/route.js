import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

  const [entries, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return NextResponse.json({ entries, totalCount, totalPages, page, pageSize })
}
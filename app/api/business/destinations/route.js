import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)



    const { searchParams } = new URL(req.url)
    const publicationId = searchParams.get('publicationId')

    const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

    const rootWhere = {
      parentId: null,
      ...(publicationId ? { publicationId } : {}),
    }

    const [rootPage, totalCount] = await Promise.all([
      prisma.destination.findMany({
        where: rootWhere,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.destination.count({ where: rootWhere }),
    ])

    const rootIds = rootPage.map((r) => r.id)

  
    const level2 = rootIds.length
      ? await prisma.destination.findMany({
          where: { parentId: { in: rootIds } },
          orderBy: { name: 'asc' },
        })
      : []

    const level2Ids = level2.map((d) => d.id)

    const level3 = level2Ids.length
      ? await prisma.destination.findMany({
          where: { parentId: { in: level2Ids } },
          orderBy: { name: 'asc' },
        })
      : []

    const destinations = [...rootPage, ...level2, ...level3]
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    return NextResponse.json({ destinations, totalCount, totalPages, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
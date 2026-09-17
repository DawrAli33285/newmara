import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { publicationId, name, level, slug, parentId, mainSponsorId } = body

    const required = ['publicationId', 'name', 'level', 'slug']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
      }
    }

    if (!['region', 'destination', 'category'].includes(level)) {
      return NextResponse.json(
        { error: "level must be one of: 'region', 'destination', 'category'." },
        { status: 400 }
      )
    }

    if (parentId) {
      const parent = await prisma.destination.findUnique({ where: { id: parentId } })
      if (!parent) {
        return NextResponse.json({ error: 'parentId does not exist.' }, { status: 400 })
      }
      if (parent.publicationId !== publicationId) {
        return NextResponse.json(
          { error: 'parent destination belongs to a different publication.' },
          { status: 400 }
        )
      }
    }
    const destination = await prisma.destination.create({
      data: {
        publicationId,
        name,
        level,
        slug,
        parentId: parentId || null,
        mainSponsorId: mainSponsorId || null,
      },
      include: { mainSponsor: true },
    })

    return NextResponse.json({ success: true, destination }, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'A destination with this slug already exists for this publication.' },
        { status: 409 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

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
        include: { mainSponsor: true },
      }),
      prisma.destination.count({ where: rootWhere }),
    ])

    const rootIds = rootPage.map((r) => r.id)

    // Fetch all descendants of this page's roots (destination + category level)
    // by walking down two levels — the tree is capped at region -> destination -> category.
    const level2 = rootIds.length
      ? await prisma.destination.findMany({
          where: { parentId: { in: rootIds } },
          orderBy: { name: 'asc' },
          include: { mainSponsor: true },
        })
      : []

    const level2Ids = level2.map((d) => d.id)

    const level3 = level2Ids.length
      ? await prisma.destination.findMany({
          where: { parentId: { in: level2Ids } },
          orderBy: { name: 'asc' },
          include: { mainSponsor: true },
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
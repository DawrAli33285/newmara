import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

  const [links, totalCount] = await Promise.all([
    prisma.campaignLink.findMany({
      include: {
        publication: { select: { title: true, slug: true } },
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.campaignLink.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return NextResponse.json({ links, totalCount, totalPages, page, pageSize })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const body = await req.json()
  const { label, channel, destinationUrl, publicationId } = body

  if (!label || !channel || !destinationUrl) {
    return NextResponse.json({ error: 'label, channel and destinationUrl are required.' }, { status: 400 })
  }

  const code = randomBytes(5).toString('hex') 

  const link = await prisma.campaignLink.create({
    data: {
      code,
      label,
      channel,
      destinationUrl,
      publicationId: publicationId || null,
      isActive: true,
    },
    include: {
      publication: { select: { title: true, slug: true } },
    },
  })

  return NextResponse.json({ link }, { status: 201 })
}
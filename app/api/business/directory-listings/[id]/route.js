import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const EDITABLE_FIELDS = ['businessName', 'category', 'location', 'telephone', 'website']
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.accountType !== 'business') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  const [listing, categories] = await Promise.all([
    prisma.directoryListing.findUnique({
      where: { id },
      include: {
        edits: {
          where: { status: { in: ['pending', 'submitted', 'mara_review'] } },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  if (!listing || listing.businessId !== session.user.id) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  return NextResponse.json({ listing, categories })
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.accountType !== 'business') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const listing = await prisma.directoryListing.findUnique({ where: { id } })
  if (!listing || listing.businessId !== session.user.id) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const changes = {}
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      changes[field] = body[field]
    }
  }

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: 'No changes submitted.' }, { status: 400 })
  }

  const edit = await prisma.directoryListingEdit.create({
    data: {
      directoryListingId: id,
      changes,
      status: 'submitted',
      submittedBy: session.user.email,
    },
  })

  return NextResponse.json({ success: true, edit }, { status: 201 })
}
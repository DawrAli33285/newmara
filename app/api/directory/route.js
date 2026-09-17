import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['business', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const body = await req.json()

    const required = ['publicationId', 'businessName', 'category']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
      }
    }

    const allowedFields = [
      'publicationId', 'destinationId', 'businessName', 'category',
      'location', 'telephone', 'website',
    ]

    const data = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }

    const isAdmin = session.user.role === 'admin'
    const submit = body.submit === true

    const listing = await prisma.directoryListing.create({
      data: {
        ...data,
        businessProfileId: session.user.businessProfileId || null,
        status: isAdmin ? 'approved' : (submit ? 'submitted' : 'draft'),
        submittedBy: isAdmin ? null : (submit ? session.user.email : null),
        submittedAt: isAdmin ? null : (submit ? new Date() : null),
        approvedBy: isAdmin ? session.user.email : null,
        approvedAt: isAdmin ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, listing }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const publicationId = searchParams.get('publicationId')
    const category = searchParams.get('category')
    const destinationId = searchParams.get('destinationId')

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId is required.' }, { status: 400 })
    }

    const listings = await prisma.directoryListing.findMany({
      where: {
        publicationId,
        status: 'live',
        ...(category ? { category } : {}),
        ...(destinationId ? { destinationId } : {}),
      },
      select: {
        id: true,
        businessName: true,
        category: true,
        location: true,
        telephone: true,
        website: true,
        businessProfileId: true,
      },
      orderBy: { businessName: 'asc' },
    })

    return NextResponse.json({ listings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
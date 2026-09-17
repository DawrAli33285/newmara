import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const categoryId    = searchParams.get('categoryId')
  const status         = searchParams.get('status')
  const publicationId = searchParams.get('publicationId')
  const search          = searchParams.get('search')

  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10))

  const where = {}
  if (status)         where.status = status
  if (publicationId) where.publications = { some: { id: publicationId } }
  if (categoryId)    where.business = { categoryId }
  if (search) {
    where.businessName = { contains: search, mode: 'insensitive' }
  }

  const [listings, totalCount] = await Promise.all([
    prisma.directoryListing.findMany({
      where,
      include: {
        business: {
          include: {
            category: true,
            subscriptions: {
              where: { status: { in: ['active', 'trialing', 'past_due'] } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        publications: true,
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.directoryListing.count({ where }),
  ])

  // Pull matching BusinessAssignment rows (destination per publication) for these listings
  const businessIds = listings.map((l) => l.businessId).filter(Boolean)
  const assignments = businessIds.length
    ? await prisma.businessAssignment.findMany({
        where: { businessId: { in: businessIds }, packageType: 'directory' },
        include: { destination: true },
      })
    : []

  const assignmentsByBusiness = new Map()
  for (const a of assignments) {
    const list = assignmentsByBusiness.get(a.businessId) || []
    list.push(a)
    assignmentsByBusiness.set(a.businessId, list)
  }

  const listingsWithAssignments = listings.map((listing) => ({
    ...listing,
    assignments: listing.businessId ? assignmentsByBusiness.get(listing.businessId) || [] : [],
  }))

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return NextResponse.json({ listings: listingsWithAssignments, totalCount, totalPages, page, pageSize })
}

export async function POST(request) {
  const body = await request.json()
  const { businessId, businessName, location, telephone, website, publicationIds, destinationIds } = body

  if (!businessId || !businessName || !publicationIds?.length || !destinationIds?.length) {
    return NextResponse.json(
      { error: 'businessId, businessName, at least one publication and at least one destination are required' },
      { status: 400 }
    )
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) {
    return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.directoryListing.create({
      data: {
        businessId,
        businessName,
        location: location || null,
        telephone: telephone || null,
        website: website || null,
        submittedBy: 'admin',
        publications: { connect: publicationIds.map((id) => ({ id })) },
      },
      include: { publications: true },
    })

    const combinations = publicationIds.flatMap((publicationId) =>
      destinationIds.map((destinationId) => ({ publicationId, destinationId }))
    )

    const assignments = await Promise.all(
      combinations.map(({ publicationId, destinationId }) =>
        tx.businessAssignment.upsert({
          where: {
            businessId_publicationId_destinationId_categoryId: {
              businessId,
              publicationId,
              destinationId,
              categoryId: business.categoryId,
            },
          },
          update: { packageType: 'directory', status: 'active' },
          create: {
            businessId,
            publicationId,
            destinationId,
            categoryId: business.categoryId,
            packageType: 'directory',
            startDate: new Date(),
            status: 'active',
          },
          include: { destination: true },
        })
      )
    )

    return { listing, assignments }
  })

  return NextResponse.json({ listing: { ...result.listing, assignments: result.assignments } })
}
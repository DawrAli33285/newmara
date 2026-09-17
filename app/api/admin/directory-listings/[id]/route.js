import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  const { id } = await params
  const body = await request.json()
  const { businessName, location, telephone, website, publicationIds, destinationIds, categoryId } = body

  if (!businessName || !publicationIds?.length || !destinationIds?.length) {
    return NextResponse.json(
      { error: 'businessName, at least one publication and at least one destination are required' },
      { status: 400 }
    )
  }

  const existing = await prisma.directoryListing.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }
  if (!existing.businessId) {
    return NextResponse.json({ error: 'This listing has no linked business to derive category from.' }, { status: 400 })
  }

  let business = await prisma.business.findUnique({ where: { id: existing.businessId } })
  if (!business) {
    return NextResponse.json({ error: 'Linked business not found.' }, { status: 404 })
  }

  if (categoryId && categoryId !== business.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    }
  }

  // Fetch existing directory assignments for this business up front, outside the transaction.
  const currentAssignments = await prisma.businessAssignment.findMany({
    where: { businessId: existing.businessId, packageType: 'directory' },
  })

  const wantedCombinations = publicationIds.flatMap((publicationId) =>
    destinationIds.map((destinationId) => ({ publicationId, destinationId }))
  )
  const wantedKeys = new Set(wantedCombinations.map((c) => `${c.publicationId}:${c.destinationId}`))
  const currentKeys = new Set(currentAssignments.map((a) => `${a.publicationId}:${a.destinationId}`))

  const toCreate = wantedCombinations.filter((c) => !currentKeys.has(`${c.publicationId}:${c.destinationId}`))
  const toReactivate = currentAssignments.filter(
    (a) => wantedKeys.has(`${a.publicationId}:${a.destinationId}`) && a.status !== 'active'
  )

  const categoryChanged = Boolean(categoryId && categoryId !== business.categoryId)
  const effectiveCategoryId = categoryChanged ? categoryId : business.categoryId

  const result = await prisma.$transaction(
    async (tx) => {
      if (categoryChanged) {
        await tx.business.update({
          where: { id: existing.businessId },
          data: { categoryId },
        })
      }

      const listing = await tx.directoryListing.update({
        where: { id },
        data: {
          businessName,
          location: location || null,
          telephone: telephone || null,
          website: website || null,
          publications: { set: publicationIds.map((pid) => ({ id: pid })) },
        },
        include: {
          publications: true,
          business: { select: { category: { select: { id: true, name: true, slug: true } } } },
        },
      })

      // Drop assignments for publications no longer selected at all
      await tx.businessAssignment.deleteMany({
        where: {
          businessId: existing.businessId,
          packageType: 'directory',
          publicationId: { notIn: publicationIds },
        },
      })

      // Bulk-create everything new in one query
      if (toCreate.length) {
        await tx.businessAssignment.createMany({
          data: toCreate.map(({ publicationId, destinationId }) => ({
            businessId: existing.businessId,
            publicationId,
            destinationId,
            categoryId: effectiveCategoryId,
            packageType: 'directory',
            startDate: new Date(),
            status: 'active',
          })),
          skipDuplicates: true,
        })
      }

      // Reactivate any previously-deactivated assignments that are wanted again
      for (const a of toReactivate) {
        await tx.businessAssignment.update({
          where: { id: a.id },
          data: { status: 'active' },
        })
      }

      // Keep every existing assignment's categoryId in sync with the business's current category
      if (categoryChanged) {
        await tx.businessAssignment.updateMany({
          where: { businessId: existing.businessId },
          data: { categoryId },
        })
      }

      const assignments = await tx.businessAssignment.findMany({
        where: {
          businessId: existing.businessId,
          packageType: 'directory',
          publicationId: { in: publicationIds },
        },
        include: { destination: true },
      })

      return { listing, assignments }
    },
    { timeout: 10000 }
  )

  return NextResponse.json({ listing: { ...result.listing, assignments: result.assignments } })
}


export async function DELETE(request, { params }) {
  const { id } = await params
  await prisma.directoryListing.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
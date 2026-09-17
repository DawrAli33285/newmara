import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.digitalPartner.findUnique({
      where: { id },
      include: { businessProfile: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Digital Partner not found.' }, { status: 404 })
    }

    const {
    
      businessName,
     
      logoUrl,
      description,
      location,
      website,
      telephone,
      mapUrl,
      socialLinks, 
      ctaText,
      ctaUrl,
     
      packageId,
      publicationIds,
      paymentStatus,
      isActive,
      startDate,
      expiryDate,
    } = body

    const businessProfileData = {}
    if (logoUrl !== undefined) businessProfileData.logoUrl = logoUrl
    if (description !== undefined) businessProfileData.description = description
    if (location !== undefined) businessProfileData.location = location
    if (website !== undefined) businessProfileData.website = website
    if (telephone !== undefined) businessProfileData.telephone = telephone
    if (mapUrl !== undefined) businessProfileData.mapUrl = mapUrl
    if (ctaText !== undefined) businessProfileData.ctaText = ctaText
    if (ctaUrl !== undefined) businessProfileData.ctaUrl = ctaUrl
    if (socialLinks !== undefined) {
      // socialLinks is Json in the schema — store as an array of non-empty lines
      businessProfileData.socialLinks =
        typeof socialLinks === 'string'
          ? socialLinks.split('\n').map((s) => s.trim()).filter(Boolean)
          : socialLinks
    }

    const partnerData = {}
    if (packageId !== undefined && packageId) partnerData.packageId = packageId
    if (paymentStatus !== undefined) partnerData.paymentStatus = paymentStatus
    if (isActive !== undefined) partnerData.isActive = isActive
    if (startDate !== undefined && startDate) partnerData.startDate = new Date(startDate)
    if (expiryDate !== undefined) partnerData.expiryDate = expiryDate ? new Date(expiryDate) : null

    await prisma.$transaction(async (tx) => {
      if (businessName !== undefined && existing.businessProfile?.businessId) {
        await tx.business.update({
          where: { id: existing.businessProfile.businessId },
          data: { businessName },
        })
      }

      if (Object.keys(businessProfileData).length > 0) {
        await tx.businessProfile.update({
          where: { id: existing.businessProfileId },
          data: businessProfileData,
        })
      }

      if (Object.keys(partnerData).length > 0) {
        await tx.digitalPartner.update({
          where: { id },
          data: partnerData,
        })
      }

      if (publicationIds !== undefined) {
        await tx.digitalPartnerPublication.deleteMany({
          where: { digitalPartnerId: id },
        })
        if (publicationIds.length > 0) {
          await tx.digitalPartnerPublication.createMany({
            data: publicationIds.map((publicationId) => ({
              digitalPartnerId: id,
              publicationId,
            })),
          })
        }
      }
    })

    const updated = await prisma.digitalPartner.findUnique({
      where: { id },
      include: {
        businessProfile: { include: { business: true } },
        package: true,
        publications: { include: { publication: true } },
      },
    })

    return NextResponse.json({ digitalPartner: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.digitalPartner.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Digital Partner not found.' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.digitalPartnerPublication.deleteMany({ where: { digitalPartnerId: id } })
      await tx.digitalPartner.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
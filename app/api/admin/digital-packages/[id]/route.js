import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params

    const digitalPackage = await prisma.digitalPackage.findUnique({
      where: { id },
      include: { _count: { select: { digitalPartners: true } } },
    })

    if (!digitalPackage) {
      return NextResponse.json({ error: 'Digital package not found.' }, { status: 404 })
    }

    return NextResponse.json({ digitalPackage })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

  
   const allowedFields = ['name', 'description', 'priceCents', 'discountedPriceCents', 'billingInterval', 'entitlements', 'isActive', 'packageType']
    const data = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }

    if (data.entitlements !== undefined && !isPlainObject(data.entitlements)) {
      return NextResponse.json(
        { error: 'entitlements must be an object, e.g. { "video": true, "website": true, "businessName": true }.' },
        { status: 400 }
      )
    }

  
   if (data.priceCents !== undefined && data.priceCents !== null) {
    if (!Number.isInteger(data.priceCents) || data.priceCents < 0) {
      return NextResponse.json({ error: 'priceCents must be a non-negative integer.' }, { status: 400 })
    }
  }

  if (data.discountedPriceCents !== undefined && data.discountedPriceCents !== null) {
    if (!Number.isInteger(data.discountedPriceCents) || data.discountedPriceCents < 0) {
      return NextResponse.json({ error: 'discountedPriceCents must be a non-negative integer.' }, { status: 400 })
    }
    const effectivePrice = data.priceCents !== undefined ? data.priceCents : undefined
    if (effectivePrice != null && data.discountedPriceCents >= effectivePrice) {
      return NextResponse.json({ error: 'discountedPriceCents must be less than priceCents.' }, { status: 400 })
    }
  }

    if (data.isActive !== undefined) {
      data.isActive = Boolean(data.isActive)
    }

    if (data.packageType !== undefined) {
      const validPackageTypes = ['digital_partner', 'directory_listing']
      if (!validPackageTypes.includes(data.packageType)) {
        return NextResponse.json(
          { error: `packageType must be one of: ${validPackageTypes.join(', ')}.` },
          { status: 400 }
        )
      }
    }

    const digitalPackage = await prisma.digitalPackage.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, digitalPackage })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A digital package with this name already exists.' }, { status: 409 })
    }
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Digital package not found.' }, { status: 404 })
    }
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

    const partnerCount = await prisma.digitalPartner.count({ where: { packageId: id } })
    if (partnerCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete — ${partnerCount} Digital Partner(s) are currently on this package. Deactivate it instead (PATCH isActive: false) or move them to another package first.`,
        },
        { status: 409 }
      )
    }

    await prisma.digitalPackage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Digital package not found.' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
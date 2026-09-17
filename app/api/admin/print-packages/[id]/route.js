import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name,
      description,
      priceCents,
      discountedPriceCents,
      entitlements,
      isActive,
    } = body

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: 'Package name is required.' }, { status: 400 })
    }

    if (priceCents != null && priceCents <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0.' }, { status: 400 })
    }

    if (
      discountedPriceCents != null &&
      priceCents != null &&
      discountedPriceCents >= priceCents
    ) {
      return NextResponse.json(
        { error: 'Discounted price must be less than the standard price.' },
        { status: 400 }
      )
    }

    const printPackage = await prisma.printPackage.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description || null }),
        ...(priceCents !== undefined && { priceCents: priceCents ?? null }),
        ...(discountedPriceCents !== undefined && {
          discountedPriceCents: discountedPriceCents ?? null,
        }),
        ...(entitlements !== undefined && { entitlements }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ printPackage })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Package not found.' }, { status: 404 })
    }
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'A package with this name already exists.' },
        { status: 409 }
      )
    }
    console.error('PRINT PACKAGE UPDATE ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    const bookingCount = await prisma.printBooking.count({
      where: { packageId: id },
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `This package is used by ${bookingCount} print booking${bookingCount === 1 ? '' : 's'} and can't be deleted. Deactivate it instead.`,
        },
        { status: 409 }
      )
    }

    await prisma.printPackage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Package not found.' }, { status: 404 })
    }
    console.error('PRINT PACKAGE DELETE ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
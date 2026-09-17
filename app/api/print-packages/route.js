import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const printPackages = await prisma.printPackage.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { bookings: true } },
      },
    })

    return NextResponse.json({ printPackages })
  } catch (err) {
    console.error('PRINT PACKAGES LIST ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      name,
      description,
      priceCents,
      discountedPriceCents,
      entitlements,
      isActive,
    } = body

    if (!name || !name.trim()) {
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

    const printPackage = await prisma.printPackage.create({
      data: {
        name: name.trim(),
        description: description || null,
        priceCents: priceCents ?? null,
        discountedPriceCents: discountedPriceCents ?? null,
        entitlements: entitlements ?? {},
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ printPackage }, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'A package with this name already exists.' },
        { status: 409 }
      )
    }
    console.error('PRINT PACKAGE CREATE ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.digitalPackage.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        entitlements: true,
        priceCents: true,
        discountedPriceCents: true,
        billingInterval: true,
        packageType: true,
      },
      orderBy: { priceCents: 'asc' },
    })
    return NextResponse.json({ packages })
  } catch (err) {
    return NextResponse.json({ error: 'Could not load packages.' }, { status: 500 })
  }
}
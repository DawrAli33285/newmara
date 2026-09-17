import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, priceCents, discountedPriceCents, billingInterval, entitlements, isActive, packageType } = body


    const required = ['name', 'entitlements']
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
      }
    }
    
    if (!isPlainObject(entitlements)) {
      return NextResponse.json(
        { error: 'entitlements must be an object, e.g. { "video": true, "website": true, "businessName": true }.' },
        { status: 400 }
      )
    }
    
    if (priceCents !== undefined && priceCents !== null) {
      if (!Number.isInteger(priceCents) || priceCents < 0) {
        return NextResponse.json({ error: 'priceCents must be a non-negative integer.' }, { status: 400 })
      }
    }

    if (discountedPriceCents !== undefined && discountedPriceCents !== null) {
      if (!Number.isInteger(discountedPriceCents) || discountedPriceCents < 0) {
        return NextResponse.json({ error: 'discountedPriceCents must be a non-negative integer.' }, { status: 400 })
      }
      if (priceCents != null && discountedPriceCents >= priceCents) {
        return NextResponse.json({ error: 'discountedPriceCents must be less than priceCents.' }, { status: 400 })
      }
    }

    
    const validPackageTypes = ['digital_partner', 'directory_listing']
    if (packageType !== undefined && !validPackageTypes.includes(packageType)) {
      return NextResponse.json(
        { error: `packageType must be one of: ${validPackageTypes.join(', ')}.` },
        { status: 400 }
      )
    }
    
 
    const digitalPackage = await prisma.digitalPackage.create({
      data: {
        name,
        description: description || null,
        priceCents: priceCents ?? null,
        discountedPriceCents: discountedPriceCents ?? null,
        billingInterval: billingInterval || null,
        entitlements,
        isActive: isActive === undefined ? true : Boolean(isActive),
        packageType: packageType || 'digital_partner',
      },
    })

    return NextResponse.json({ success: true, digitalPackage }, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A digital package with this name already exists.' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isActiveParam = searchParams.get('isActive')
    const packageTypeParam = searchParams.get('packageType')

    const where = {
      ...(isActiveParam !== null ? { isActive: isActiveParam === 'true' } : {}),
      ...(packageTypeParam !== null ? { packageType: packageTypeParam } : {}),
    }

    const digitalPackages = await prisma.digitalPackage.findMany({
      where,
      include: { _count: { select: { digitalPartners: true } } },
      orderBy: { priceCents: 'asc' },
    })

    return NextResponse.json({ digitalPackages })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
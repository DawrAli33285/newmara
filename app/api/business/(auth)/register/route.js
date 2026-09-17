import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { businessName, email, password, categoryId } = await req.json()

    if (!businessName || !email || !password || !categoryId) {
      return NextResponse.json(
        { error: 'Business name, email, password and category are required.' },
        { status: 400 }
      )
    }

    const existing = await prisma.business.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'A business account with this email already exists.' },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json(
        { error: 'Selected category is invalid.' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const business = await prisma.business.create({
      data: {
        businessName,
        email,
        passwordHash,
        categoryId,
      },
    })

    return NextResponse.json({ success: true, businessId: business.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
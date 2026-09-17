import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ categories })
}

export async function POST(request) {
  const body = await request.json()
  const { name, isActive } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 })
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slugify(name),
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
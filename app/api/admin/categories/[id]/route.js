import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const body = await request.json()
  const { name, isActive } = body

  const data = {}
  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json({ error: 'name cannot be empty.' }, { status: 400 })
    }
    data.name = name.trim()
    data.slug = slugify(name)
  }
  if (isActive !== undefined) {
    data.isActive = isActive
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    })
    return NextResponse.json({ category })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    }
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params

  const inUse = await prisma.business.findFirst({ where: { categoryId: id } })
  if (inUse) {
    return NextResponse.json(
      { error: 'This category is assigned to at least one business and cannot be deleted. Deactivate it instead.' },
      { status: 409 }
    )
  }

  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
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

    const allowedFields = ['name', 'slug', 'level', 'parentId', 'mainSponsorId']

    const data = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }

    if (data.level && !['region', 'destination', 'category'].includes(data.level)) {
      return NextResponse.json(
        { error: "level must be one of: 'region', 'destination', 'category'." },
        { status: 400 }
      )
    }

    if (data.parentId === id) {
      return NextResponse.json({ error: 'A destination cannot be its own parent.' }, { status: 400 })
    }

    const destination = await prisma.destination.update({
      where: { id },
      data,
      include: { mainSponsor: true },
    })

    return NextResponse.json({ success: true, destination })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'A destination with this slug already exists for this publication.' },
        { status: 409 }
      )
    }
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Destination not found.' }, { status: 404 })
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

    const children = await prisma.destination.findFirst({ where: { parentId: id } })
    if (children) {
      return NextResponse.json(
        { error: 'Cannot delete a destination that has child destinations. Delete or reassign children first.' },
        { status: 409 }
      )
    }

    const [offerCount, assignmentCount] = await Promise.all([
      prisma.offer.count({ where: { destinationId: id } }),
      prisma.businessAssignment.count({ where: { destinationId: id } }),
    ])
    const linkedCount = offerCount + assignmentCount
    if (linkedCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${linkedCount} record(s) are tagged with this destination.` },
        { status: 409 }
      )
    }

    await prisma.destination.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Destination not found.' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
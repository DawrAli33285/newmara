import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { id } = params

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
        parent: true,
      },
    })

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found.' }, { status: 404 })
    }

    return NextResponse.json({ destination })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
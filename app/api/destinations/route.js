import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const publicationId = searchParams.get('publicationId')

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId is required.' }, { status: 400 })
    }

    const destinations = await prisma.destination.findMany({
      where: {
        publicationId,
        parentId: null,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ destinations })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
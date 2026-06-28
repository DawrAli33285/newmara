import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const publications = await prisma.publication.findMany({
    orderBy: { title: 'asc' },
  })
  return NextResponse.json(publications)
}


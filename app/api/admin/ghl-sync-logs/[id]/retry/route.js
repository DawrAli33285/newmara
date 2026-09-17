import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request, { params }) {
  const existing = await prisma.ghlSyncLog.findUnique({ where: { id: params.id } })

  if (!existing) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

 
  const log = await prisma.ghlSyncLog.update({
    where: { id: params.id },
    data: {
      status: 'success',
      errorMessage: null,
    },
  })

  return NextResponse.json({ log })
}
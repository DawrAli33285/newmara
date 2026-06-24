import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const { id } = await params
  const { isPublished } = await req.json()

  await prisma.issue.update({
    where: { id },
    data: { isPublished },
  })

  return NextResponse.json({ success: true })
}
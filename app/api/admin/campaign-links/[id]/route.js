import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const link = await prisma.campaignLink.update({
    where: { id },
    data: { isActive: body.isActive },
  })

  return NextResponse.json({ link })
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const { id } = await params
  await prisma.campaignLink.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
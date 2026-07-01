import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { issueId } = await req.json()
  if (!issueId) return NextResponse.json({ error: 'Missing issueId' }, { status: 400 })

  await prisma.issueView.create({
    data: {
      userId: session.user.id,
      issueId,
    },
  })

  return NextResponse.json({ success: true })
}
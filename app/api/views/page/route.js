import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'admin') {
    return NextResponse.json({ success: true, skipped: true })
  }

  const { issueId, pageNumber } = await req.json()
  if (!issueId || !pageNumber) return NextResponse.json({ error: 'Missing issueId or pageNumber' }, { status: 400 })

  await prisma.pageView.create({
    data: {
      userId: session.user.id,
      issueId,
      pageNumber,
    },
  })

  return NextResponse.json({ success: true })
}
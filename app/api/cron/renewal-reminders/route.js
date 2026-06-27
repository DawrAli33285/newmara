import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendRenewalReminderEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in8Days = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)

  const expiring = await prisma.subscription.findMany({
    where: {
      status: 'active',
      currentPeriodEnd: {
        gte: in7Days,
        lt: in8Days,
      },
    },
    include: {
      user: true,
      publication: true,
    },
  })

  const results = []

  for (const sub of expiring) {
    try {
      await sendRenewalReminderEmail({
        to: sub.user.email,
        name: sub.user.name || 'Subscriber',
        publicationTitle: sub.publication.title,
        expiresAt: sub.currentPeriodEnd,
        renewUrl: `${process.env.NEXTAUTH_URL}/subscribe/${sub.publication.slug}`,
      })
      results.push({ email: sub.user.email, publication: sub.publication.slug, status: 'sent' })
    } catch (err) {
      results.push({ email: sub.user.email, publication: sub.publication.slug, status: 'failed', error: err.message })
    }
  }

  return NextResponse.json({ sent: results.length, results })
}
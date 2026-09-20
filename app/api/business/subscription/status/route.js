
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.accountType !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const subscription = await prisma.businessSubscription.findFirst({
      where: {
        businessId: session.user.id,
        status: { in: ['active', 'trialing', 'incomplete', 'past_due'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { digitalPackage: true, printPackage: true },
    })
    console.log("HAS SUBSCRUTIPION")
    console.log(subscription)

    return NextResponse.json({
      hasSubscription: !!subscription,
      subscription,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not check subscription status.' }, { status: 500 })
  }
}
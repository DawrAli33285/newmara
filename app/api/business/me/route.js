
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.accountType !== 'business') {
      return NextResponse.json({ business: null })
    }

    return NextResponse.json({
      business: {
        id: session.user.id,
        email: session.user.email,
        businessName: session.user.businessName,
      },
    })
  } catch (err) {
    return NextResponse.json({ business: null })
  }
}
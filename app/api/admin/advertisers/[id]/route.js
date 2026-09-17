import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const advertiser = await prisma.advertiser.update({
      where: { id },
      data: {
        advertiserName: body.advertiserName,
        telephone: body.telephone,
      },
      include: {
        business: { select: { businessName: true, email: true, category: true } },
        printBookings: {
          include: {
            publication: { select: { title: true } },
            package: { select: { name: true } },
          },
        },
      },
    })

    return NextResponse.json({ advertiser })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params

    await prisma.advertiser.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
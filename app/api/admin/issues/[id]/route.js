import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { isPublished } = await req.json()
    const publication = await prisma.publication.update({
      where: { id },
      data: { isPublished },
    })
    return NextResponse.json(publication)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}



export async function DELETE(req, { params }) {
  try {
    const { id } = await params

   
    const subscriptions = await prisma.subscription.findMany({
      where: { publicationId: id },
    })

   
    for (const sub of subscriptions) {
      if (sub.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
        } catch (stripeErr) {
          console.error(`Failed to cancel ${sub.stripeSubscriptionId}:`, stripeErr.message)
        }
      }
    }


    await prisma.$transaction([
      prisma.subscription.deleteMany({ where: { publicationId: id } }),
      prisma.issue.deleteMany({ where: { publicationId: id } }),
      prisma.publication.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
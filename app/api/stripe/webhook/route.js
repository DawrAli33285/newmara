// import { NextResponse } from 'next/server'
// import nodemailer from 'nodemailer'
// import { stripe } from '@/lib/stripe'
// import { prisma } from '@/lib/prisma'

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// })

// export async function POST(req) {
//   const body = await req.text()
//   const sig = req.headers.get('stripe-signature')

//   let event
//   try {
//     event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
//   } catch (err) {
//     return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object

//     if (session.mode === 'subscription') {
//       const sub = await stripe.subscriptions.retrieve(session.subscription)
//       const { userId, publicationId } = sub.metadata

//       if (userId && publicationId) {
//         await prisma.subscription.upsert({
//           where: { userId_publicationId: { userId, publicationId } },
//           create: {
//             userId,
//             publicationId,
//             stripeSubscriptionId: sub.id,
//             stripeCustomerId: sub.customer,
//             status: 'active',
//             currentPeriodEnd: sub.current_period_end
//               ? new Date(sub.current_period_end * 1000)
//               : null,
//           },
//           update: {
//             stripeSubscriptionId: sub.id,
//             stripeCustomerId: sub.customer,
//             status: 'active',
//             currentPeriodEnd: sub.current_period_end
//               ? new Date(sub.current_period_end * 1000)
//               : null,
//           },
//         })
//       }
//     }

//     if (session.mode === 'payment') {
//       const payment = await prisma.advertiserPayment.findFirst({
//         where: { stripePaymentLinkId: session.id },
//         include: { publication: { select: { title: true } } },
//       })

//       await prisma.advertiserPayment.updateMany({
//         where: { stripePaymentLinkId: session.id },
//         data: {
//           status: 'paid',
//           stripePaymentIntentId: session.payment_intent,
//         },
//       })

//       if (payment?.advertiserEmail) {
//         try {
//           const info = await transporter.sendMail({
//             from: `"Mara Media" <${process.env.EMAIL_USER}>`,
//             to: payment.advertiserEmail,
//             subject: 'Payment Confirmation — Mara Media',
//             html: `
//               <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
//                 <h2 style="color: #1a3460;">Payment Received</h2>
//                 <p>Hi ${payment.advertiserName},</p>
//                 <p>We've received your payment of <strong>€${(payment.amountCents / 100).toFixed(2)}</strong> for <strong>${payment.publication.title}</strong>.</p>
//                 <p style="color:#666;font-size:14px;">Thank you for advertising with Mara Media.</p>
//               </div>
//             `,
//           })
//           console.log('[stripe/webhook] confirmation email sent:', info.messageId)
//         } catch (mailErr) {
//           console.error('[stripe/webhook] FAILED to send confirmation email:', mailErr)
//         }
//       }
//     }
//   }

//   if (event.type === 'customer.subscription.updated') {
//     const sub = event.data.object
//     await prisma.subscription.updateMany({
//       where: { stripeSubscriptionId: sub.id },
//       data: {
//         status: sub.status === 'active' ? 'active' : 'expired',
//         ...(sub.current_period_end
//           ? { currentPeriodEnd: new Date(sub.current_period_end * 1000) }
//           : {}),
//       },
//     })
//   }

//   if (event.type === 'customer.subscription.deleted') {
//     const sub = event.data.object
//     await prisma.subscription.updateMany({
//       where: { stripeSubscriptionId: sub.id },
//       data: { status: 'cancelled' },
//     })
//   }

//   return NextResponse.json({ received: true })
// }


import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.mode === 'subscription') {
      const sub = await stripe.subscriptions.retrieve(session.subscription)
      const { userId, publicationId } = sub.metadata

      if (userId && publicationId) {
        await prisma.subscription.upsert({
          where: { userId_publicationId: { userId, publicationId } },
          create: {
            userId,
            publicationId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer,
            status: 'active',
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
          update: {
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer,
            status: 'active',
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        })
      }
    }

    if (session.mode === 'payment') {
      const payment = await prisma.advertiserPayment.findFirst({
        where: { stripePaymentLinkId: session.id },
        include: { publication: { select: { title: true } } },
      })

      await prisma.advertiserPayment.updateMany({
        where: { stripePaymentLinkId: session.id },
        data: {
          status: 'paid',
          stripePaymentIntentId: session.payment_intent,
        },
      })

      if (payment?.advertiserEmail) {
        try {
          const info = await transporter.sendMail({
            from: `"Mara Media" <${process.env.EMAIL_USER}>`,
            to: payment.advertiserEmail,
            subject: 'Payment Confirmation — Mara Media',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #1a3460;">Payment Received</h2>
                <p>Hi ${payment.advertiserName},</p>
                <p>We've received your payment of <strong>€${(payment.amountCents / 100).toFixed(2)}</strong> for <strong>${payment.publication.title}</strong>.</p>
                <p style="color:#666;font-size:14px;">Thank you for advertising with Mara Media.</p>
              </div>
            `,
          })
          console.log('[stripe/webhook] confirmation email sent:', info.messageId)
        } catch (mailErr) {
          console.error('[stripe/webhook] FAILED to send confirmation email:', mailErr)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const status = sub.status === 'active' ? 'active' : 'expired'
    const currentPeriodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : undefined

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status,
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      },
    })

    await prisma.businessSubscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status: sub.status,
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      },
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: 'cancelled' },
    })

    await prisma.businessSubscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: 'cancelled' },
    })
  }

  return NextResponse.json({ received: true })
}

// import { NextResponse } from 'next/server'
// import Stripe from 'stripe'
// import { prisma } from '@/lib/prisma'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// export async function POST(req) {
//   try {
//     const { businessId, packageId, paymentMethodId } = await req.json()

//     if (!businessId || !packageId || !paymentMethodId) {
//       return NextResponse.json(
//         { error: 'businessId, packageId and paymentMethodId are required.' },
//         { status: 400 }
//       )
//     }

//     const business = await prisma.business.findUnique({ where: { id: businessId } })
//     if (!business) {
//       return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
//     }

//     const pkg = await prisma.digitalPackage.findUnique({ where: { id: packageId } })
//     if (!pkg) {
//       return NextResponse.json({ error: 'Package not found.' }, { status: 404 })
//     }

//     if (pkg.packageType !== 'digital_partner' && pkg.packageType !== 'directory_listing') {
//       return NextResponse.json(
//         { error: 'Only digital_partner and directory_listing packages support subscriptions.' },
//         { status: 400 }
//       )
//     }

  
//    if (pkg.priceCents == null) {
//     return NextResponse.json({ error: 'This package has no price set.' }, { status: 400 })
//   }

//   const chargeCents = pkg.discountedPriceCents ?? pkg.priceCents

//   const stripeInterval = pkg.billingInterval === 'annual' ? 'year' : 'month'

   
//     let stripeCustomerId = business.stripeCustomerId
//     if (!stripeCustomerId) {
//       const customer = await stripe.customers.create({
//         email: business.email,
//         name: business.businessName,
//         metadata: { businessId: business.id },
//       })
//       stripeCustomerId = customer.id

//       await prisma.business.update({
//         where: { id: business.id },
//         data: { stripeCustomerId },
//       })
//     }

    
//     await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId })
//     await stripe.customers.update(stripeCustomerId, {
//       invoice_settings: { default_payment_method: paymentMethodId },
//     })

//     const product = await stripe.products.create({
//         name: pkg.name,
//         metadata: { packageId: pkg.id },
//       })
      
  
//   const subscription = await stripe.subscriptions.create({
//     customer: stripeCustomerId,
//     items: [
//       {
//         price_data: {
//           currency: 'eur',
//           product: product.id,
//           unit_amount: chargeCents,
//           recurring: { interval: stripeInterval },
//         },
//       },
//     ],
//     default_payment_method: paymentMethodId,
//     expand: ['latest_invoice.payment_intent'],
//     metadata: {
//       businessId: business.id,
//       packageId: pkg.id,
//       standardPriceCents: String(pkg.priceCents),
//       chargedPriceCents: String(chargeCents),
//     },
//   })
      

   
//    const businessSubscription = await prisma.businessSubscription.create({
//     data: {
//       businessId: business.id,
//       packageId: pkg.id,
//       packageType: pkg.packageType,
//       stripeSubscriptionId: subscription.id,
//       stripeCustomerId,
//       status: subscription.status,
//       priceCentsCharged: chargeCents,
//       currentPeriodEnd: subscription.current_period_end
//         ? new Date(subscription.current_period_end * 1000)
//         : null,
//     },
//   })

//     return NextResponse.json({
//       success: true,
//       businessSubscription,
//       clientSecret: subscription.latest_invoice?.payment_intent?.client_secret ?? null,
//       status: subscription.status,
//     })
//   } catch (err) {
//     console.error(err)
//     return NextResponse.json({ error: err.message || 'Could not create subscription.' }, { status: 500 })
//   }
// }



import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { businessId, packageId, paymentMethodId } = await req.json()

    if (!businessId || !packageId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'businessId, packageId and paymentMethodId are required.' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
    }

    // A packageId may belong to either a DigitalPackage or a PrintPackage.
    // Try digital first, then fall back to print.
    let pkg = await prisma.digitalPackage.findUnique({ where: { id: packageId } })
    let isPrintPackage = false

    if (!pkg) {
      pkg = await prisma.printPackage.findUnique({ where: { id: packageId } })
      isPrintPackage = true
    }

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found.' }, { status: 404 })
    }

    const packageType = isPrintPackage ? 'advertiser' : pkg.packageType

    if (
      !isPrintPackage &&
      pkg.packageType !== 'digital_partner' &&
      pkg.packageType !== 'directory_listing'
    ) {
      return NextResponse.json(
        { error: 'Only digital_partner, directory_listing and print packages support subscriptions.' },
        { status: 400 }
      )
    }

    if (pkg.priceCents == null) {
      return NextResponse.json({ error: 'This package has no price set.' }, { status: 400 })
    }

    const chargeCents = pkg.discountedPriceCents ?? pkg.priceCents

    
  const stripeInterval = pkg.billingInterval === 'annual' ? 'year' : 'month'

    let stripeCustomerId = business.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: business.email,
        name: business.businessName,
        metadata: { businessId: business.id },
      })
      stripeCustomerId = customer.id

      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId },
      })
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId })
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    const product = await stripe.products.create({
      name: pkg.name,
      metadata: { packageId: pkg.id },
    })

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price_data: {
            currency: 'eur',
            product: product.id,
            unit_amount: chargeCents,
            recurring: { interval: stripeInterval },
          },
        },
      ],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        businessId: business.id,
        packageId: pkg.id,
        packageType,
        standardPriceCents: String(pkg.priceCents),
        chargedPriceCents: String(chargeCents),
      },
    })

    const businessSubscription = await prisma.businessSubscription.create({
      data: {
        businessId: business.id,
        packageType,
        digitalPackageId: isPrintPackage ? null : pkg.id,
        printPackageId: isPrintPackage ? pkg.id : null,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId,
        status: subscription.status,
        priceCentsCharged: chargeCents,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    })
    
    return NextResponse.json({
      success: true,
      businessSubscription,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret ?? null,
      status: subscription.status,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Could not create subscription.' }, { status: 500 })
  }
}
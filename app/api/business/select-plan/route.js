// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// const VALID_OPTIONS = ['advertiser', 'digital_partner', 'directory_listing', 'digital_partner_advertiser']

// export async function POST(req) {
//   try {
//     const { businessId, option, packageId, destinationId, publicationIds } = await req.json()

//     if (!businessId || !VALID_OPTIONS.includes(option)) {
//       return NextResponse.json({ error: 'Invalid selection.' }, { status: 400 })
//     }

//     const business = await prisma.business.findUnique({ where: { id: businessId } })
//     if (!business) {
//       return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
//     }

//     const includesAdvertiser = option === 'advertiser' || option === 'digital_partner_advertiser'
//     const includesDigitalPartner = option === 'digital_partner' || option === 'digital_partner_advertiser'
//     const includesDirectory = option === 'directory_listing'

//     if (includesDigitalPartner && (!publicationIds || publicationIds.length === 0)) {
//       return NextResponse.json({ error: 'At least one publication is required for this option.' }, { status: 400 })
//     }

//     if (includesDirectory && (!publicationIds || publicationIds.length === 0)) {
//       return NextResponse.json({ error: 'A publication is required for a directory listing.' }, { status: 400 })
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       const created = {}

//       if (includesAdvertiser) {
//         created.advertiser = await tx.advertiser.upsert({
//           where: { businessId },
//           update: {},
//           create: { businessId, advertiserName: business.businessName },
//         })
//       }

//       if (includesDigitalPartner) {
//         if (!packageId) {
//           throw new Error('A digital package is required for this option.')
//         }

//         const profile = await tx.businessProfile.upsert({
//           where: { businessId },
//           update: destinationId !== undefined ? { destinationId: destinationId || null } : {},
//           create: { businessId, destinationId: destinationId || null },
//         })

//         created.digitalPartner = await tx.digitalPartner.upsert({
//           where: { businessProfileId: profile.id },
//           update: { packageId, isActive: true },
//           create: {
//             businessProfileId: profile.id,
//             packageId,
//             startDate: new Date(),
//             paymentStatus: 'pending',
//           },
//         })

//         // Replace publication links with the ones chosen on this page
//         await tx.digitalPartnerPublication.deleteMany({
//           where: { digitalPartnerId: created.digitalPartner.id },
//         })
//         await tx.digitalPartnerPublication.createMany({
//           data: publicationIds.map((publicationId) => ({
//             digitalPartnerId: created.digitalPartner.id,
//             publicationId,
//           })),
//         })
//       }

 
//    if (includesDirectory) {
//     // Directory Listing uses a single publicationId in the schema — take the first choice
//     const publicationId = publicationIds[0]

//     const existingListing = await tx.directoryListing.findFirst({
//       where: { businessId, publicationId },
//     })

//     created.directoryListing = existingListing
//       ? existingListing
//       : await tx.directoryListing.create({
//           data: {
//             businessId,
//             publicationId,
//             destinationId: destinationId || null,
//             businessName: business.businessName,
//             category: business.category,
//             status: 'draft',
//             submittedBy: business.email,
//           },
//         })
//   }
//       return created
//     })

//     return NextResponse.json({ success: true, result }, { status: 200 })
//   } catch (err) {
//     console.error('SELECT PLAN ERROR:', err)
//     return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 })
//   }
// }




import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_OPTIONS = ['advertiser', 'digital_partner', 'directory_listing', 'digital_partner_advertiser']

export async function POST(req) {
  try {
    const { businessId, option, packageId, destinationIds, publicationIds } = await req.json()

    
    if (!businessId || !VALID_OPTIONS.includes(option)) {
      return NextResponse.json({ error: 'Invalid selection.' }, { status: 400 })
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
    }

    const includesAdvertiser = option === 'advertiser' || option === 'digital_partner_advertiser'
    const includesDigitalPartner = option === 'digital_partner' || option === 'digital_partner_advertiser'
    const includesDirectory = option === 'directory_listing'

    if (includesDigitalPartner && (!publicationIds || publicationIds.length === 0)) {
      return NextResponse.json({ error: 'At least one publication is required for this option.' }, { status: 400 })
    }

    if (includesDirectory && (!publicationIds || publicationIds.length === 0)) {
      return NextResponse.json({ error: 'A publication is required for a directory listing.' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = {}

      if (includesAdvertiser) {
        created.advertiser = await tx.advertiser.upsert({
          where: { businessId },
          update: {},
          create: { businessId, advertiserName: business.businessName },
        })
      }

      if (includesDigitalPartner) {
        if (!packageId) {
          throw new Error('A digital package is required for this option.')
        }
        if (!destinationIds || destinationIds.length === 0) {
          throw new Error('At least one destination is required for this option.')
        }
      
        const profile = await tx.businessProfile.upsert({
          where: { businessId },
          update: {},
          create: { businessId },
        })
      
        created.digitalPartner = await tx.digitalPartner.upsert({       
          where: { businessProfileId: profile.id },
          update: { packageId, isActive: true, paymentStatus: 'active' },
          create: {
            businessProfileId: profile.id,
            packageId,
            startDate: new Date(),
            paymentStatus: 'active',
          },
        })
      
       
        await tx.digitalPartnerPublication.deleteMany({
          where: { digitalPartnerId: created.digitalPartner.id },
        })
        await tx.digitalPartnerPublication.createMany({
          data: publicationIds.map((publicationId) => ({
            digitalPartnerId: created.digitalPartner.id,
            publicationId,
          })),
        })
      
        const combinations = publicationIds.flatMap((publicationId) =>
          destinationIds.map((destinationId) => ({ publicationId, destinationId }))
        )
      
        created.assignments = await Promise.all(
          combinations.map(({ publicationId, destinationId }) =>
            tx.businessAssignment.upsert({
              where: {
                businessId_publicationId_destinationId_categoryId: {
                  businessId,
                  publicationId,
                  destinationId,
                  categoryId: business.categoryId,
                },
              },
              update: { packageType: 'digital_package', packageId, status: 'active' },
              create: {
                businessId,
                publicationId,
                destinationId,
                categoryId: business.categoryId,
                packageType: 'digital_package',
                packageId,
                startDate: new Date(),
                status: 'active',
              },
            })
          )
        )
      }


      if (includesDirectory) {
        if (!destinationIds || destinationIds.length === 0) {
          throw new Error('At least one destination is required for a directory listing.')
        }
      
        const publicationId = publicationIds[0]
      
        const existingListing = await tx.directoryListing.findFirst({
          where: { businessId, publications: { some: { id: publicationId } } },
        })
      
        created.directoryListing = existingListing
          ? existingListing
          : await tx.directoryListing.create({
              data: {
                businessId,
                businessName: business.businessName,
                status: 'live',
                submittedBy: business.email,
                publications: { connect: { id: publicationId } },
              },
            })
      
        const combinations = publicationIds.flatMap((publicationId) =>
          destinationIds.map((destinationId) => ({ publicationId, destinationId }))
        )
      
        created.assignments = await Promise.all(
          combinations.map(({ publicationId, destinationId }) =>
            tx.businessAssignment.upsert({
              where: {
                businessId_publicationId_destinationId_categoryId: {
                  businessId,
                  publicationId,
                  destinationId,
                  categoryId: business.categoryId,
                },
              },
              update: { packageType: 'directory', packageId, status: 'active' },
              create: {
                businessId,
                publicationId,
                destinationId,
                categoryId: business.categoryId,
                packageType: 'directory',
                packageId,
                startDate: new Date(),
                status: 'active',
              },
            })
          )
        )
      }


      return created
    }, {
      maxWait: 10000, 
      timeout: 15000, 
    })

    return NextResponse.json({ success: true, result }, { status: 200 })
  } catch (err) {
    console.error('SELECT PLAN ERROR:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong.' }, { status: 500 })
  }
}
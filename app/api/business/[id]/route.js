// // import { NextResponse } from 'next/server'
// // import { prisma } from '@/lib/prisma'

// // export async function GET(req, { params }) {
// //   try {
// //     const { id } = await params

   
// //     const business = await prisma.business.findUnique({
// //         where: { id },
// //         select: {
// //           id: true,
// //           businessName: true,
// //           category: true,
// //           email: true,
// //           businessProfile: {
// //           select: {
// //             logoUrl: true,
// //             description: true,
// //             location: true,
// //             mapUrl: true,
// //             website: true,
// //             telephone: true,
// //             socialLinks: true,
// //             galleryUrls: true,
// //             promoVideoUrl: true,
// //             ctaText: true,
// //             ctaUrl: true,
// //             offers: {
// //               where: { status: 'live' },
// //               select: {
// //                 id: true,
// //                 title: true,
// //                 description: true,
// //                 imageUrl: true,
// //                 promoCode: true,
// //                 ctaText: true,
// //                 ctaUrl: true,
// //                 expiryDate: true,
// //               },
// //             },
// //           },
// //         },
// //       },
// //     })

// //     if (!business || !business.businessProfile) {
// //       return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
// //     }

// //     return NextResponse.json({
// //         business: {
// //           id: business.id,
// //           businessName: business.businessName,
// //           category: business.category,
// //           email: business.email,
// //           ...business.businessProfile,
// //         },
// //       })
// //   } catch (err) {
// //     console.error('BUSINESS DETAIL ERROR:', err)
// //     return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
// //   }
// // }


// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET(req, { params }) {
//   try {
//     const { id } = await params

//     const business = await prisma.business.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         businessName: true,
//         category: true,
//         email: true,
//         businessProfile: {
//           select: {
//             id: true,
//             logoUrl: true,
//             description: true,
//             location: true,
//             mapUrl: true,
//             website: true,
//             telephone: true,
//             socialLinks: true,
//             galleryUrls: true,
//             promoVideoUrl: true,
//             ctaText: true,
//             ctaUrl: true,
//             destination: {
//               select: { publicationId: true },
//             },
//             digitalPartner: {
//               select: {
//                 publications: {
//                   select: { publicationId: true },
//                   take: 1,
//                 },
//               },
//             },
//             offers: {
//               where: { status: 'live' },
//               select: {
//                 id: true,
//                 title: true,
//                 description: true,
//                 imageUrl: true,
//                 promoCode: true,
//                 ctaText: true,
//                 ctaUrl: true,
//                 expiryDate: true,
//               },
//             },
//           },
//         },
//       },
//     })

//     if (!business || !business.businessProfile) {
//       return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
//     }

//     const { destination, digitalPartner, id: businessProfileId, ...profileRest } = business.businessProfile

//     const publicationId =
//       destination?.publicationId ||
//       digitalPartner?.publications?.[0]?.publicationId ||
//       null

//     return NextResponse.json({
//       business: {
//         id: business.id,
//         businessProfileId,
//         publicationId,
//         businessName: business.businessName,
//         category: business.category,
//         email: business.email,
//         ...profileRest,
//       },
//     })
//   } catch (err) {
//     console.error('BUSINESS DETAIL ERROR:', err)
//     return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const isLoggedInReader = session?.user?.accountType === 'user'

    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        email: true,
        category: { select: { name: true } },
        assignments: {
          select: { publicationId: true },
          take: 1,
        },
        businessProfile: {
          select: {
            id: true,
            logoUrl: true,
            description: true,
            location: true,
            mapUrl: true,
            website: true,
            telephone: true,
            socialLinks: true,
            galleryUrls: true,
            promoVideoUrl: true,
            ctaText: true,
            ctaUrl: true,
            digitalPartner: {
              select: {
                publications: {
                  select: { publicationId: true },
                  take: 1,
                },
              },
            },
            offers: {
              where: { status: 'live' },
              select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                promoCode: true,
                ctaText: true,
                ctaUrl: true,
                expiryDate: true,
                visibility: true,
              },
            },
          },
        },
      },
    })

    if (!business || !business.businessProfile) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
    }

    const { digitalPartner, id: businessProfileId, offers, ...profileRest } =
      business.businessProfile

    const publicationId =
      business.assignments?.[0]?.publicationId ||
      digitalPartner?.publications?.[0]?.publicationId ||
      null

    let isSubscriber = false
    if (isLoggedInReader && publicationId) {
      const sub = await prisma.subscription.findUnique({
        where: {
          userId_publicationId: {
            userId: session.user.id,
            publicationId,
          },
        },
        select: { status: true },
      })
      isSubscriber = sub?.status === 'active'
    }

    const visibleOffers = offers
      .filter((offer) => {
        if (offer.visibility === 'public') return true
        if (offer.visibility === 'registered') return isLoggedInReader
        if (offer.visibility === 'subscriber') return isSubscriber
        return false
      })
      .map(({ visibility, ...rest }) => rest)

    return NextResponse.json({
      business: {
        id: business.id,
        businessProfileId,
        publicationId,
        businessName: business.businessName,
        category: business.category?.name || 'Uncategorized',
        email: business.email,
        ...profileRest,
        offers: visibleOffers,
      },
    })
  } catch (err) {
    console.error('BUSINESS DETAIL ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
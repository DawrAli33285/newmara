// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET(req, { params }) {
//   try {
//     const { slug } = await params

//     const publication = await prisma.publication.findUnique({
//       where: { slug, isPublished: true },
//       select: {
//         id: true,
//         title: true,
//         slug: true,
//         description: true,
//         coverImageUrl: true,
//         _count: {
//           select: {
//             issues: true,
//             ads: {
//               where: { status: 'approved', isActive: true },
//             },
//           },
//         },
//       },
//     })


//     if (!publication) {
//       return NextResponse.json({ error: 'Publication not found.' }, { status: 404 })
//     }

//     const directoryListings = await prisma.directoryListing.findMany({
//       where: { publicationId: publication.id, status: 'live' },
//       select: {
//         id: true,
//         businessName: true,
//         category: true,
//         location: true,
//       },
//       orderBy: { businessName: 'asc' },
//     })

   
//    const digitalPartnerLinks = await prisma.digitalPartnerPublication.findMany({
//     where: { publicationId: publication.id },
//     select: {
//       digitalPartner: {
//         select: {
//           isActive: true,
//           businessProfile: {
//             select: {
//               businessId: true,
//               business: {
//                 select: { businessName: true, category: true },
//               },
//               location: true,
//             },
//           },
//         },
//       },
//     },
//   })

//     const digitalPartners = digitalPartnerLinks
//       .filter((link) => link.digitalPartner.isActive)
//       .map((link) => ({
//         id: link.digitalPartner.businessProfile.businessId,
//         businessName: link.digitalPartner.businessProfile.business?.businessName || 'Unknown',
//         category: link.digitalPartner.businessProfile.business?.category || 'Uncategorized',
//         location: link.digitalPartner.businessProfile.location,
//       }))


//       return NextResponse.json({
//         publication: {
//           slug: publication.slug,
//           title: publication.title,
//           description: publication.description,
//           coverImageUrl: publication.coverImageUrl,
//           issueCount: publication._count.issues,
//           adCount: publication._count.ads,
//         },
//         directoryListings,
//         digitalPartners,
//       })
//   } catch (err) {
//     console.error('PUBLICATION VIEW ERROR:', err)
//     return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
//   }
// }



import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { slug } = await params

    const publication = await prisma.publication.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImageUrl: true,
        _count: {
          select: {
            issues: true,
            ads: {
              where: { status: 'approved', isActive: true },
            },
          },
        },
      },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found.' }, { status: 404 })
    }

    const directoryListingRows = await prisma.directoryListing.findMany({
      where: {
        publications: { some: { id: publication.id } },
        status: { not: 'draft' },
      },
      select: {
        id: true,
        businessName: true,
        location: true,
        business: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { businessName: 'asc' },
    })

    const directoryListings = directoryListingRows.map((d) => ({
      id: d.id,
      businessName: d.businessName,
      location: d.location,
      category: d.business?.category?.name || 'Uncategorized',
    }))

    const digitalPartnerLinks = await prisma.digitalPartnerPublication.findMany({
      where: { publicationId: publication.id },
      select: {
        digitalPartner: {
          select: {
            isActive: true,
            businessProfile: {
              select: {
                businessId: true,
                location: true,
                business: {
                  select: {
                    businessName: true,
                    category: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    const digitalPartners = digitalPartnerLinks
      .filter((link) => link.digitalPartner.isActive)
      .map((link) => ({
        id: link.digitalPartner.businessProfile.businessId,
        businessName: link.digitalPartner.businessProfile.business?.businessName || 'Unknown',
        category: link.digitalPartner.businessProfile.business?.category?.name || 'Uncategorized',
        location: link.digitalPartner.businessProfile.location,
      }))

    return NextResponse.json({
      publication: {
        slug: publication.slug,
        title: publication.title,
        description: publication.description,
        coverImageUrl: publication.coverImageUrl,
        issueCount: publication._count.issues,
        adCount: publication._count.ads,
      },
      directoryListings,
      digitalPartners,
    })
  } catch (err) {
    console.error('PUBLICATION VIEW ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
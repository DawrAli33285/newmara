// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET(req, { params }) {
//   try {
//     const { id } = await params

//     const listing = await prisma.directoryListing.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         businessName: true,
//         category: true,
//         location: true,
//         telephone: true,
//         website: true,
//         publicationId: true,   
//         status: true,
//         publication: {
//           select: { title: true, slug: true },
//         },
//         destination: {
//           select: { name: true },
//         },
//       },
//     })

//     if (!listing) {
//       return NextResponse.json({ error: 'not_found' }, { status: 404 })
//     }

//     if (listing.status !== 'live') {
//       return NextResponse.json({ error: 'not_live', status: listing.status }, { status: 403 })
//     }

//     return NextResponse.json({ listing })
//   } catch (err) {
//     console.error('DIRECTORY LISTING DETAIL ERROR:', err)
//     return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
//   }
// }


// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

// export async function POST(req, { params }) {
 
//   try {
//     const { id } = await params

//     const session = await getServerSession(authOptions)

//     if (session?.user?.role === 'admin') {
//       return NextResponse.json({ success: true, skipped: true })
//     }

//     if (session?.user?.accountType === 'business') {
//       const listing = await prisma.directoryListing.findUnique({
//         where: { id },
//         select: { businessId: true },
//       })

//       if (listing?.businessId === session.user.id) {
//         return NextResponse.json({ success: true, skipped: true })
//       }
//     }

//     await prisma.engagementEvent.create({
//       data: {
//         eventType: 'directory_profile_view',
//         directoryListingId: id,
//         publicationId: listing?.publicationId ?? null,
//       },
//     })

//     return NextResponse.json({ success: true })
//   } catch (err) {
//     console.error('DIRECTORY VIEW TRACKING ERROR:', err)
//     return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req, { params }) {
  try {
    const { id } = await params

    const listing = await prisma.directoryListing.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
        businessName: true,
        location: true,
        telephone: true,
        website: true,
        status: true,
        publications: {
          select: { title: true, slug: true },
        },
        business: {
          select: {
            category: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    if (listing.status !== 'live') {
      return NextResponse.json({ error: 'not_live', status: listing.status }, { status: 403 })
    }

    let entitlements = null
    if (listing.businessId) {
      const allAssignments = await prisma.businessAssignment.findMany({
        where: { businessId: listing.businessId },
        select: {
          id: true,
          packageType: true,
          status: true,
          packageId: true,
          startDate: true,
        },
      })
     
      const assignment = await prisma.businessAssignment.findFirst({
        where: {
          businessId: listing.businessId,
          packageType: 'directory',
          status: 'active',
          packageId: { not: null },
        },
        orderBy: { startDate: 'desc' },
        select: {
          package: { select: { entitlements: true } },
        },
      })
     
      entitlements = assignment?.package?.entitlements ?? null
    }

    return NextResponse.json({ listing: { ...listing, entitlements } })
  } catch (err) {
    console.error('DIRECTORY LISTING DETAIL ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)

    if (session?.user?.role === 'admin') {
      return NextResponse.json({ success: true, skipped: true })
    }

    const listing = await prisma.directoryListing.findUnique({
      where: { id },
      select: { businessId: true },
    })

    if (session?.user?.accountType === 'business' && listing?.businessId === session.user.id) {
      return NextResponse.json({ success: true, skipped: true })
    }

    await prisma.engagementEvent.create({
      data: {
        eventType: 'directory_profile_view',
        directoryListingId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DIRECTORY VIEW TRACKING ERROR:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
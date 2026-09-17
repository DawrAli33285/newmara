
// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export async function PATCH(req, { params }) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user || session.user.role !== 'admin') {
//       return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
//     }

//     const { editId } = params
//     const body = await req.json()
//     const { action, rejectionReason } = body 

//     if (!['approve', 'deny'].includes(action)) {
//       return NextResponse.json({ error: 'action must be "approve" or "deny".' }, { status: 400 })
//     }

//     if (action === 'deny' && !rejectionReason) {
//       return NextResponse.json({ error: 'rejectionReason is required when denying.' }, { status: 400 })
//     }

//     const edit = await prisma.businessProfileEdit.findUnique({ where: { id: editId } })

//     if (!edit) {
//       return NextResponse.json({ error: 'Edit request not found.' }, { status: 404 })
//     }

//     if (edit.status !== 'pending') {
//       return NextResponse.json({ error: `This edit has already been ${edit.status}.` }, { status: 409 })
//     }

//     if (action === 'approve') {
     
//       const [updatedProfile, updatedEdit] = await prisma.$transaction([
//         prisma.businessProfile.update({
//           where: { id: edit.businessProfileId },
//           data: edit.changes, 
//         }),
//         prisma.businessProfileEdit.update({
//           where: { id: editId },
//           data: {
//             status: 'approved',
//             reviewedAt: new Date(),
//             reviewedBy: session.user.id,
//           },
//         }),
//       ])

//       return NextResponse.json({
//         success: true,
//         message: 'Changes approved and applied.',
//         businessProfile: updatedProfile,
//         edit: updatedEdit,
//       })
//     }

//     // action === 'deny'
//     const updatedEdit = await prisma.businessProfileEdit.update({
//       where: { id: editId },
//       data: {
//         status: 'denied',
//         reviewedAt: new Date(),
//         reviewedBy: session.user.id,
//         rejectionReason,
//       },
//     })

//     return NextResponse.json({ success: true, message: 'Changes denied.', edit: updatedEdit })
//   } catch (err) {
//     console.error(err)
//     return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
//   }
// }



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

    const { editId } = params
    const body = await req.json()
    const { action, rejectionReason } = body

    if (!['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'action must be "approve" or "deny".' }, { status: 400 })
    }

    if (action === 'deny' && !rejectionReason) {
      return NextResponse.json({ error: 'rejectionReason is required when denying.' }, { status: 400 })
    }

    const edit = await prisma.businessProfileEdit.findUnique({
      where: { id: editId },
      include: { businessProfile: { select: { businessName: true } } },
    })

    if (!edit) {
      return NextResponse.json({ error: 'Edit request not found.' }, { status: 404 })
    }

    if (edit.status !== 'pending') {
      return NextResponse.json({ error: `This edit has already been ${edit.status}.` }, { status: 409 })
    }

    const reviewerId = session.user.email || session.user.id
    const recordLabel = `${edit.businessProfile?.businessName || 'Business'} — profile update`

    if (action === 'approve') {
      const [updatedProfile, updatedEdit] = await prisma.$transaction([
        prisma.businessProfile.update({
          where: { id: edit.businessProfileId },
          data: edit.changes,
        }),
        prisma.businessProfileEdit.update({
          where: { id: editId },
          data: {
            status: 'approved',
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        }),
      ])

      
      await prisma.auditLog.create({
        data: {
          actor: reviewerId,
          action: 'approved',
          recordLabel,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Changes approved and applied.',
        businessProfile: updatedProfile,
        edit: updatedEdit,
      })
    }

   
    const updatedEdit = await prisma.businessProfileEdit.update({
      where: { id: editId },
      data: {
        status: 'denied',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionReason,
      },
    })

  
    await prisma.auditLog.create({
      data: {
        actor: reviewerId,
        action: `denied (${rejectionReason})`,
        recordLabel,
      },
    })

    return NextResponse.json({ success: true, message: 'Changes denied.', edit: updatedEdit })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
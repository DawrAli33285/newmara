import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  })

  if (!adminUser || adminUser.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AdminSidebar email={session.user.email} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
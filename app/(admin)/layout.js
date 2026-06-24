import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-[#1C3664] min-h-screen flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <span className="text-white font-bold text-lg">Mara Media</span>
          <p className="text-blue-300 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard">📊 Dashboard</NavLink>
          <NavLink href="/publications">📖 Publications</NavLink>
          <NavLink href="/subscribers">👥 Subscribers</NavLink>
          <NavLink href="/advertisers">💼 Advertisers</NavLink>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <p className="text-blue-300 text-xs">{session.user.email}</p>
          <Link
            href="/api/auth/signout"
            className="text-xs text-red-300 hover:text-red-100 mt-1 block"
          >
            Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
    >
      {children}
    </Link>
  )
}
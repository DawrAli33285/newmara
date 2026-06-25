import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function SubscribersPage({ searchParams }) {
  await getServerSession(authOptions)

  const statusFilter = searchParams?.status || 'all'
  const search = searchParams?.search || ''

  const where = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(search && {
      user: { email: { contains: search, mode: 'insensitive' } },
    }),
  }

  const [subscribers, totalActive, totalExpired, totalCancelled] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: true, publication: true },
    }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'expired' } }),
    prisma.subscription.count({ where: { status: 'cancelled' } }),
  ])

  const statusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'expired') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscribers</h1>
      <p className="text-gray-500 text-sm mb-8">Manage all reader subscriptions</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl p-6 bg-green-50 text-green-700">
          <p className="text-3xl font-bold">{totalActive}</p>
          <p className="text-sm font-medium mt-1 opacity-75">Active</p>
        </div>
        <div className="rounded-xl p-6 bg-yellow-50 text-yellow-700">
          <p className="text-3xl font-bold">{totalExpired}</p>
          <p className="text-sm font-medium mt-1 opacity-75">Expired</p>
        </div>
        <div className="rounded-xl p-6 bg-red-50 text-red-700">
          <p className="text-3xl font-bold">{totalCancelled}</p>
          <p className="text-sm font-medium mt-1 opacity-75">Cancelled</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by email..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {subscribers.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No subscribers found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Publication</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Expires</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{sub.user.email}</td>
                  <td className="px-6 py-3 text-gray-600">{sub.publication.title}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IE')
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString('en-IE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">{subscribers.length} result{subscribers.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
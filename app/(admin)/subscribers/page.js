import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function SubscribersPage({ searchParams }) {
  await getServerSession(authOptions)

  const awaitedParams = await searchParams
  const statusFilter = awaitedParams?.status || 'all'
  const search = awaitedParams?.search || ''

  const where = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(search && {
      business: {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
    }),
  }

  const [subscribers, totalActive, totalExpired, totalCancelled, topIssues, topPublications, topPages, recentViews] = await Promise.all([
    prisma.businessSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        business: true,
        digitalPackage: true,
        printPackage: true,
      },
    }),
    prisma.businessSubscription.count({ where: { status: 'active' } }),
    prisma.businessSubscription.count({ where: { status: 'expired' } }),
    prisma.businessSubscription.count({ where: { status: 'cancelled' } }),
    prisma.issueView.groupBy({
      by: ['issueId'],
      _count: { issueId: true },
      orderBy: { _count: { issueId: 'desc' } },
      take: 5,
    }),
    prisma.subscription.groupBy({
      by: ['publicationId'],
      where: { status: 'active' },
      _count: { publicationId: true },
      orderBy: { _count: { publicationId: 'desc' } },
      take: 5,
    }),
    prisma.pageView.groupBy({
      by: ['issueId', 'pageNumber'],
      _count: { pageNumber: true },
      orderBy: { _count: { pageNumber: 'desc' } },
      take: 5,
    }),
    prisma.issueView.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  const topIssuesHydrated = await Promise.all(
    topIssues.map(async (v) => {
      const issue = await prisma.issue.findUnique({
        where: { id: v.issueId },
        include: { publication: { select: { title: true } } },
      })
      return { ...v, issue }
    })
  )

  const topPublicationsHydrated = await Promise.all(
    topPublications.map(async (p) => {
      const publication = await prisma.publication.findUnique({
        where: { id: p.publicationId },
        select: { title: true },
      })
      return { ...p, publication }
    })
  )

  const topPagesHydrated = await Promise.all(
    topPages.map(async (p) => {
      const issue = await prisma.issue.findUnique({
        where: { id: p.issueId },
        include: { publication: { select: { title: true } } },
      })
      return { ...p, issue }
    })
  )

  const statusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'expired') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscribers</h1>
      <p className="text-gray-500 text-sm mb-8">Manage all business subscriptions</p>

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

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by business name or email..."
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {subscribers.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No subscribers found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Business</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Package</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                
                <th className="text-left px-6 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">
                    <p className="text-gray-900">{sub.business.businessName}</p>
                    <p className="text-xs text-gray-400">{sub.business.email}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
  {sub.digitalPackage?.name || sub.printPackage?.name || '—'}
</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(sub.status)}`}>
                      {sub.status}
                    </span>
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

      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reading Analytics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-6 bg-blue-50 text-blue-700">
            <p className="text-3xl font-bold">{recentViews}</p>
            <p className="text-sm font-medium mt-1 opacity-75">Issue Opens (Last 30 Days)</p>
          </div>
          <div className="rounded-xl p-6 bg-purple-50 text-purple-700">
            <p className="text-3xl font-bold">{topIssuesHydrated.length > 0 ? topIssuesHydrated[0]._count.issueId : 0}</p>
            <p className="text-sm font-medium mt-1 opacity-75">Most Read Issue Opens</p>
          </div>
          <div className="rounded-xl p-6 bg-indigo-50 text-indigo-700">
            <p className="text-3xl font-bold">{totalActive}</p>
            <p className="text-sm font-medium mt-1 opacity-75">Active Subscriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Most Read Issues</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by total opens</p>
            </div>
            {topIssuesHydrated.length === 0 ? (
              <p className="text-gray-400 text-sm p-6">No reading data yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {topIssuesHydrated.map((v, idx) => (
                  <div key={v.issueId} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.issue?.title || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{v.issue?.publication?.title || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{v._count.issueId}</p>
                      <p className="text-xs text-gray-400">opens</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Most Subscribed Publications</h3>
              <p className="text-xs text-gray-400 mt-0.5">Active reader subscribers per publication</p>
            </div>
            {topPublicationsHydrated.length === 0 ? (
              <p className="text-gray-400 text-sm p-6">No subscription data yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {topPublicationsHydrated.map((p, idx) => (
                  <div key={p.publicationId} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                      <p className="text-sm font-medium text-gray-900">{p.publication?.title || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">{p._count.publicationId}</p>
                      <p className="text-xs text-gray-400">subscribers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Most Read Pages</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by total page opens</p>
            </div>
            {topPagesHydrated.length === 0 ? (
              <p className="text-gray-400 text-sm p-6">No page reading data yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {topPagesHydrated.map((p, idx) => (
                  <div key={`${p.issueId}-${p.pageNumber}`} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Page {p.pageNumber}</p>
                        <p className="text-xs text-gray-400">
                          {p.issue?.title || 'Unknown'} · {p.issue?.publication?.title || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-teal-600">{p._count.pageNumber}</p>
                      <p className="text-xs text-gray-400">reads</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [
    totalSubscribers,
    totalPublications,
    totalIssues,
    totalDigitalPartners,
    totalAdvertisers,
    totalDirectoryListings,
    pendingApprovals,
    unresolvedEnquiries,
    recentSubscribers,
    recentBusinesses,
  ] = await Promise.all([
    prisma.businessSubscription.count({ where: { status: 'active' } }),
    prisma.publication.count(),
    prisma.issue.count({ where: { isPublished: true } }),
    prisma.digitalPartner.count({ where: { isActive: true } }),
    prisma.advertiser.count(),
    prisma.directoryListing.count({ where: { status: 'live' } }),
    prisma.businessProfileEdit.count({ where: { status: 'pending' } }) +
      (await prisma.offer.count({ where: { status: 'submitted' } })) +
      (await prisma.directoryListingEdit.count({ where: { status: 'submitted' } })),
    prisma.enquiry.count({ where: { status: { not: 'delivered' } } }),
    prisma.businessSubscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        business: true,
        digitalPackage: true,
        printPackage: true,
      },
    }),
    prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        businessName: true,
        email: true,
        createdAt: true,
        category: {
          select: { name: true }
        }
      }
    })
  ])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Welcome back, {session.user.email}</p>

      <div className="grid grid-cols-2 gap-6 mb-6 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Subscribers" value={totalSubscribers} color="bg-blue-50 text-blue-700" />
        <StatCard label="Published Issues" value={totalIssues} color="bg-green-50 text-green-700" />
        <StatCard label="Publications" value={totalPublications} color="bg-purple-50 text-purple-700" />
        <StatCard label="Digital Partners" value={totalDigitalPartners} color="bg-teal-50 text-teal-700" />
        <StatCard label="Advertisers" value={totalAdvertisers} color="bg-amber-50 text-amber-700" />
        <StatCard label="Directory Listings" value={totalDirectoryListings} color="bg-indigo-50 text-indigo-700" />
      </div>

      {(pendingApprovals > 0 || unresolvedEnquiries > 0) && (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pendingApprovals > 0 && (
            <a
              href="/profile-edits"
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 transition hover:border-amber-300"
            >
              <span className="text-sm font-semibold text-amber-800">
                {pendingApprovals} item{pendingApprovals === 1 ? '' : 's'} awaiting approval
              </span>
              <span className="text-xs font-bold text-amber-600">Review →</span>
            </a>
          )}
        
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Subscribers</h2>
          </div>
          {recentSubscribers.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">No subscribers yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Package</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-black">
                      <p className="font-medium">{sub.business.businessName}</p>
                      <p className="text-xs text-gray-400">{sub.business.email}</p>
                    </td>
                    <td className="px-4 py-3 text-black">
  {sub.digitalPackage?.name || sub.printPackage?.name || '—'}
</td>
                    <td className="px-4 py-3 text-black">
                      <span className={`px-2 py-1 rounded-full text-xs text-black font-medium ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString('en-IE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Business Signups</h2>
          </div>
          {recentBusinesses.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">No businesses yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBusinesses.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-black">
                      <p className="font-medium">{b.businessName}</p>
                      <p className="text-xs text-gray-400">{b.email}</p>
                    </td>
                    <td className="px-4 py-3 text-black">
  {b.category.name}
</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString('en-IE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-75">{label}</p>
    </div>
  )
}
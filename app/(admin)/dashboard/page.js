import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [totalSubscribers, totalPublications, totalIssues, recentSubscribers] = await Promise.all([
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.publication.count(),
    prisma.issue.count({ where: { isPublished: true } }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, publication: true },
    }),
  ])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Welcome back, {session.user.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard label="Active Subscribers" value={totalSubscribers} color="bg-blue-50 text-blue-700" />
        <StatCard label="Published Issues" value={totalIssues} color="bg-green-50 text-green-700" />
        <StatCard label="Publications" value={totalPublications} color="bg-purple-50 text-purple-700" />
      </div>

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
                <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Publication</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-black">{sub.user.email}</td>
                  <td className="px-6 py-3 text-black">{sub.publication.title}</td>
                  <td className="px-6 py-3 text-black">
                    <span className={`px-2 py-1 rounded-full text-xs text-black font-medium ${
                      sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
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
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl p-6 ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-75">{label}</p>
    </div>
  )
}
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        include: { publication: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  const activeSubscriptions = user.subscriptions.filter(s => s.status === 'active')
  const pastSubscriptions = user.subscriptions.filter(s => s.status !== 'active')

  const statusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'expired') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-gray-900 text-lg">My Account</h1>
        <a href="/" className="text-sm text-blue-600 hover:underline">← Home</a>
      </div>

      <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role} account</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Subscriptions</h2>
          </div>
          {activeSubscriptions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm mb-4">You have no active subscriptions.</p>
              <a
                href="/#publications"
                className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Browse Publications
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeSubscriptions.map((sub) => (
                <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.publication.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {sub.currentPeriodEnd
                        ? `Renews ${new Date(sub.currentPeriodEnd).toLocaleDateString('en-IE')}`
                        : 'Annual subscription'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                    <a
                      href={`/read/${sub.publication.slug}`}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      Read →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pastSubscriptions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Past Subscriptions</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pastSubscriptions.map((sub) => (
                <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.publication.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Joined {new Date(sub.createdAt).toLocaleDateString('en-IE')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <a
            href="/api/auth/signout"
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Sign out
          </a>
        </div>

      </div>
    </div>
  )
}
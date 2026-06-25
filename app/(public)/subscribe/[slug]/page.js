import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SubscribeButton from './SubscribeButton'

const styleMap = {
  'the-skipper':  { color: 'from-blue-900 to-blue-700',       emoji: '⚓',  price: '€49/year' },
  'take-off':     { color: 'from-sky-800 to-sky-600',         emoji: '✈️',  price: '€29/year' },
  'go-west':      { color: 'from-emerald-800 to-emerald-600', emoji: '🌿', price: '€29/year' },
  'the-business': { color: 'from-slate-800 to-slate-600',     emoji: '📈', price: '€29/year' },
  'due-south':    { color: 'from-amber-800 to-amber-600',     emoji: '🧭', price: '€29/year' },
}

export default async function SubscribePage({ params }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  const publication = await prisma.publication.findUnique({ where: { slug } })
  if (!publication) redirect('/')

  let alreadySubscribed = false
  if (session) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      const existing = await prisma.subscription.findFirst({
        where: { userId: user.id, publicationId: publication.id, status: 'active' },
      })
      alreadySubscribed = !!existing
    }
  }

  const style = styleMap[slug] || { color: 'from-blue-900 to-blue-700', emoji: '📖', price: '€29/year' }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">

        <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
          <div className={`bg-gradient-to-br ${style.color} h-48 flex items-center justify-center`}>
            <span className="text-7xl">{style.emoji}</span>
          </div>

          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{publication.title}</h1>
            {publication.description && (
              <p className="text-gray-500 text-sm mb-6">{publication.description}</p>
            )}

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Annual subscription</span>
                <span className="text-xl font-bold text-blue-700">{style.price}</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Access to all published issues</li>
                <li>✓ Full archive of back issues</li>
                <li>✓ Interactive flipbook reader</li>
                <li>✓ Read on any device</li>
              </ul>
            </div>

            {alreadySubscribed ? (
              <div className="space-y-3">
                <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm font-medium text-center">
                  ✓ You are already subscribed
                </div>
                <a
                  href={`/read/${slug}`}
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Read Now →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {session ? (
                  <SubscribeButton publicationId={publication.id} slug={slug} />
                ) : (
                  <a
                    href={`/login?callbackUrl=/subscribe/${slug}`}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Log in to Subscribe
                  </a>
                )}
                <a
                  href="/"
                  className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition"
                >
                  ← Back to home
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
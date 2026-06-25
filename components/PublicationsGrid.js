import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const styleMap = {
  'the-skipper':  { color: 'from-blue-900 to-blue-700',       emoji: '⚓',  issues: '12 issues/year' },
  'take-off':     { color: 'from-sky-800 to-sky-600',         emoji: '✈️',  issues: 'Annual' },
  'go-west':      { color: 'from-emerald-800 to-emerald-600', emoji: '🌿', issues: 'Annual' },
  'the-business': { color: 'from-slate-800 to-slate-600',     emoji: '📈', issues: 'Annual' },
  'due-south':    { color: 'from-amber-800 to-amber-600',     emoji: '🧭', issues: 'Annual' },
}

const fallbackColors = [
  'from-blue-900 to-blue-700',
  'from-purple-900 to-purple-700',
  'from-green-900 to-green-700',
  'from-red-900 to-red-700',
  'from-orange-900 to-orange-700',
]

export default async function PublicationsGrid() {
  const publications = await prisma.publication.findMany({
    orderBy: { title: 'asc' },
  })

  return (
    <section id="publications" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Publications</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Five magazines. One platform.</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Subscribe to the publication you love and get instant access to every issue — past and present.
          </p>
        </div>

        {publications.length === 0 ? (
          <p className="text-center text-gray-400">No publications available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((pub, i) => {
              const style = styleMap[pub.slug] || {
                color: fallbackColors[i % fallbackColors.length],
                emoji: '📖',
                issues: 'Regular',
              }
              return (
                <div
                  key={pub.slug}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {pub.coverImageUrl ? (
                    <img
                      src={pub.coverImageUrl}
                      alt={pub.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className={`bg-gradient-to-br ${style.color} h-56 flex items-center justify-center`}>
                      <span className="text-6xl">{style.emoji}</span>
                    </div>
                  )}

                  <div className="bg-white p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{pub.title}</h3>
                      <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {style.issues}
                      </span>
                    </div>
                    {pub.description && (
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{pub.description}</p>
                    )}
                    <Link
                      href={`/subscribe/${pub.slug}`}
                      className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Subscribe →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
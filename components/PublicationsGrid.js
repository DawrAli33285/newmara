import Link from 'next/link'

const publications = [
  {
    slug: 'the-skipper',
    title: 'The Skipper',
    description: "Ireland's leading maritime magazine covering fishing, boating and coastal life.",
    color: 'from-blue-900 to-blue-700',
    emoji: '⚓',
    issues: '12 issues/year',
  },
  {
    slug: 'take-off',
    title: 'Take Off',
    description: 'Aviation news, pilot stories and airshow coverage from across Ireland.',
    color: 'from-sky-800 to-sky-600',
    emoji: '✈️',
    issues: 'Annual',
  },
  {
    slug: 'go-west',
    title: 'Go West',
    description: 'Celebrating the culture, landscape and people of the west of Ireland.',
    color: 'from-emerald-800 to-emerald-600',
    emoji: '🌿',
    issues: 'Annual',
  },
  {
    slug: 'the-business',
    title: 'The Business',
    description: 'News, interviews and insight from the Irish business community.',
    color: 'from-slate-800 to-slate-600',
    emoji: '📈',
    issues: 'Annual',
  },
  {
    slug: 'due-south',
    title: 'Due South',
    description: 'Exploring the stories, towns and hidden gems of southern Ireland.',
    color: 'from-amber-800 to-amber-600',
    emoji: '🧭',
    issues: 'Annual',
  },
]

export default function PublicationsGrid() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <div
              key={pub.slug}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className={`bg-gradient-to-br ${pub.color} h-56 flex items-center justify-center`}>
                <span className="text-6xl">{pub.emoji}</span>
              </div>

              <div className="bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{pub.title}</h3>
                  <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-full whitespace-nowrap">
                    {pub.issues}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{pub.description}</p>
                <Link
                  href="/public/subscribe"
                  className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Subscribe →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
import Link from 'next/link'

const categories = [
  {
    slug: 'eat-drink',
    name: 'Eat & Drink',
    description: 'Restaurants, cafés, bars and food experiences',
    icon: '🍴',
    total: 4,
    pending: 2,
  },
  {
    slug: 'accommodation',
    name: 'Accommodation',
    description: 'Hotels, apartments and places to stay',
    icon: '🛏️',
    total: 3,
    pending: 1,
  },
  {
    slug: 'taxi-transport',
    name: 'Taxi & Transport',
    description: 'Taxis, car hire and transport providers',
    icon: '🚕',
    total: 2,
    pending: 1,
  },
  {
    slug: 'things-to-do',
    name: 'Things To Do',
    description: 'Activities, attractions and local experiences',
    icon: '🎟️',
    total: 5,
    pending: 3,
  },
  {
    slug: 'shopping',
    name: 'Shopping',
    description: 'Retailers, boutiques and local shopping',
    icon: '🛍️',
    total: 2,
    pending: 0,
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    description: 'Salons, spas and wellness businesses',
    icon: '✨',
    total: 1,
    pending: 1,
  },
  {
    slug: 'golf',
    name: 'Golf',
    description: 'Golf clubs, courses and golf services',
    icon: '⛳',
    total: 2,
    pending: 0,
  },
  {
    slug: 'visitor-services',
    name: 'Visitor Services',
    description: 'Tourism offices, guides and visitor support',
    icon: '🧭',
    total: 3,
    pending: 2,
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    description: 'Business, legal and specialist services',
    icon: '💼',
    total: 2,
    pending: 1,
  },
]

export default function BusinessChangesPage() {
  const totalChanges = categories.reduce(
    (sum, category) => sum + category.total,
    0
  )

  const totalPending = categories.reduce(
    (sum, category) => sum + category.pending,
    0
  )

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#668b2f]">
            Admin approval
          </p>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
                Business changes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Review business profile, directory, offer and promotional
                changes before they are published live.
              </p>
            </div>

            <div className="flex gap-3">
              <SummaryCard
                label="Total changes"
                value={totalChanges}
              />

              <SummaryCard
                label="Mara review"
                value={totalPending}
              />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#0b1830]">
            Business categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a category to monitor and process submitted changes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/business-changes/${category.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#9bc84b] hover:shadow-md"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#edf5df] text-2xl">
                  {category.icon}
                </div>

                {category.pending > 0 && (
                  <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-[#9a6a00]">
                    {category.pending} in review
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#0b1830]">
                {category.name}
              </h3>

              <p className="mt-2 min-h-[42px] text-sm leading-6 text-gray-500">
                {category.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-medium text-gray-400">
                  {category.total} total changes
                </span>

                <span className="text-sm font-semibold text-[#668b2f] transition group-hover:translate-x-1">
                  Review →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="min-w-[125px] rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-2xl font-bold text-[#0b1830]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  )
}
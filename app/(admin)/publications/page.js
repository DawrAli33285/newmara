import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import PublishToggle from './PublishToggle'
import DeletePublicationButton from './DeletePublicationButton'
import EditPublicationButton from './EditPublicationButton'

async function withLivePrice(pub) {
  if (!pub.stripePriceId) return { ...pub, priceEuros: null, priceLabel: 'No price set' }
  try {
    const price = await stripe.prices.retrieve(pub.stripePriceId)
    const euros = (price.unit_amount / 100).toFixed(2)
    const interval = price.recurring?.interval || 'month'
    return {
      ...pub,
      priceEuros: euros,
      priceLabel: `€${euros} / ${interval}`,
    }
  } catch {
    return { ...pub, priceEuros: null, priceLabel: 'Price unavailable' }
  }
}

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({
    include: { _count: { select: { issues: true } } },
    orderBy: { title: 'asc' },
  })

  const withPrices = await Promise.all(publications.map(withLivePrice))

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0B1830' }}>
            Publications
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#657084' }}>
            {publications.length} publication{publications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/publications/create"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#2F7D1B' }}
        >
          + Create Publication
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {withPrices.map((pub) => (
          <div
            key={pub.id}
            className="overflow-hidden rounded-2xl border bg-white transition hover:shadow-md"
            style={{ borderColor: '#D9E0E7' }}
          >
            {pub.coverImageUrl ? (
              <img
                src={pub.coverImageUrl}
                alt={pub.title}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div
                className="flex h-48 w-full items-center justify-center"
                style={{ backgroundColor: '#0B1830' }}
              >
                <span className="px-4 text-center text-xl font-bold text-white">
                  {pub.title}
                </span>
              </div>
            )}

            <div className="p-5">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h2 className="text-base font-bold" style={{ color: '#0B1830' }}>
                  {pub.title}
                </h2>
                <span
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: pub.isPublished ? '#EFF5EE' : '#F7F8FA',
                    color: pub.isPublished ? '#2F7D1B' : '#657084',
                  }}
                >
                  {pub.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-3 text-sm" style={{ color: '#657084' }}>
                <span>
                  {pub._count.issues} issue{pub._count.issues !== 1 ? 's' : ''}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold" style={{ color: '#0B1830' }}>
                  {pub.priceLabel}
                </span>
              </div>

              <Link
                href={`/publications/${pub.slug}`}
                className="block rounded-lg py-2 text-center text-sm font-medium transition hover:bg-gray-100"
                style={{ backgroundColor: '#F7F8FA', color: '#0B1830' }}
              >
                View Issues
              </Link>

              <EditPublicationButton publication={pub} />
              <PublishToggle id={pub.id} isPublished={pub.isPublished} />
              <DeletePublicationButton id={pub.id} title={pub.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
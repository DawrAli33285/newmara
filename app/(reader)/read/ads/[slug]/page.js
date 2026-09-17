import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import BackButton from '@/components/BackButton'
import AdFlipbookWrapper from '@/components/AdFlipbookWrapper'
const PREVIEW_PAGE_LIMIT = 4

export default async function AdsPage({ params, searchParams }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: {
      ads: {
        where: { status: 'approved', isActive: true },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!publication) redirect('/')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const awaitedSearch = await searchParams


  const isSubscribed = true
  // const awaitedSearch = await searchParams
  // const isAdmin = user?.role === 'admin'

  // let isSubscribed = isAdmin

  // if (!isAdmin) {
  //   if (awaitedSearch?.subscribed === '1') {
  //     await new Promise((r) => setTimeout(r, 2000))
  //   }

  //   const subscription = await prisma.subscription.findFirst({
  //     where: {
  //       userId: user?.id,
  //       publicationId: publication.id,
  //       status: 'active',
  //     },
  //   })
  //   isSubscribed = !!subscription
  // }

  if (publication.ads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{publication.title}</h1>
          <p className="text-gray-500">No ads published yet. Check back soon.</p>
          <a href="/" className="mt-4 inline-block text-blue-600 text-sm hover:underline">← Back to home</a>
        </div>
      </div>
    )
  }

  const latestAd = publication.ads[0]

  const selectedAdId = awaitedSearch?.ad || latestAd.id
  const selectedAd = publication.ads.find(a => a.id === selectedAdId) || latestAd

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">{publication.title}</h1>
            <p className="text-xs text-gray-500 leading-tight">{selectedAd.label || 'Advertisement'}</p>
          </div>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-700 transition">Home</a>
        </div>

        <div className="flex items-center gap-4">
          {!isSubscribed && (
            <Link
              href={`/subscribe/${slug}`}
              className="text-xs sm:text-sm font-semibold text-white px-3 sm:px-4 py-2 rounded-full transition hover:opacity-90"
              style={{ backgroundColor: '#2F7D1B', minHeight: 36 }}
            >
              Subscribe
            </Link>
          )}
          <BackButton />
        </div>
      </div>

     
      {publication.ads.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-2 overflow-x-auto sticky top-[45px] z-30">
          {publication.ads.map((ad) => (
            <a
              key={ad.id}
              href={`/read/ads/${slug}?ad=${ad.id}`}
              className={`px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                ad.id === selectedAd.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ad.label || 'Ad'}
            </a>
          ))}
        </div>
      )}

      <div className="px-2">
      <AdFlipbookWrapper
  pdfUrl={selectedAd.pdfUrl}
  title={selectedAd.label || 'Advertisement'}
  adId={selectedAd.id}
  linkUrl={selectedAd.linkUrl}
  linkType={selectedAd.linkType}
  linkLabel={selectedAd.label}
  pageNumber={selectedAd.pageNumber}
  isSubscribed={isSubscribed}
  previewLimit={PREVIEW_PAGE_LIMIT}
  publicationSlug={slug}
/>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StripeCardModal from '@/components/StripeCardModal'



const OPTIONS = [
  {
    id: 'advertiser',
    tag: 'Print',
    title: 'Advertiser',
    description: 'Book space in the printed publication.',
    includes: ['Print bookings', 'Advertiser payments & invoicing'],
    hasDigitalPartner: false,
  },
  {
    id: 'digital_partner',
    tag: 'Digital',
    title: 'Digital Partner',
    description: 'A digital business profile with online engagement tracking.',
    includes: ['Business profile page', 'Offers & directory visibility', 'Engagement analytics'],
    hasDigitalPartner: true,
  },
  {
    id: 'directory_listing',
    tag: 'Directory',
    title: 'Directory Listing',
    description: 'A simple searchable listing, no full profile.',
    includes: ['Listed in the business directory', 'Basic contact details shown'],
    hasDigitalPartner: false,
  },
  // {
  //   id: 'digital_partner_advertiser',
  //   tag: 'Print + Digital',
  //   title: 'Digital Partner + Advertiser',
  //   description: 'Both print bookings and a full digital profile.',
  //   includes: ['Everything in Advertiser', 'Everything in Digital Partner'],
  //   hasDigitalPartner: true,
  // },
]

function needsMultiplePublications(selected) {
  return (
    selected === 'digital_partner' ||
    selected === 'digital_partner_advertiser' ||
    selected === 'directory_listing'
  )
}


export default function SelectPlanPage() {
  const router = useRouter()
  const [businessId, setBusinessId] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [selected, setSelected] = useState(null)
  const [packages, setPackages] = useState([])
const [printPackages, setPrintPackages] = useState([])
  const [packageId, setPackageId] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [regionId, setRegionId] = useState(null)
  const [destinationIds, setDestinationIds] = useState([])
  const [publications, setPublications] = useState([])
  const [publicationIds, setPublicationIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [existingSubscription, setExistingSubscription] = useState(null)



  useEffect(() => {
    async function load() {
      try {
        const [sessionRes, packagesRes, printPackagesRes, planStatusRes, destinationsRes, publicationsRes, subStatusRes] = await Promise.all([
          fetch('/api/business/me'),
          fetch('/api/digital-packages'),
          fetch('/api/print-packages'),
          fetch('/api/business/plan-status'),
          fetch('/api/business/destinations'),
          fetch('/api/admin/publications'),
          fetch('/api/business/subscription/status'),
        ])
        
        const sessionData = await sessionRes.json()
        const packagesData = await packagesRes.json()
        const printPackagesData = await printPackagesRes.json()
        const planStatusData = await planStatusRes.json()
        const destinationsData = await destinationsRes.json()
        const publicationsData = await publicationsRes.json()
        const subStatusData = await subStatusRes.json()

console.log('destinations data', destinationsData)

if (!sessionData.business) {
          router.replace('/business/login')
          return
        }
  
        if (planStatusData.hasPlan) {
          router.replace('/business/dashboard')
          return
        }
  
        setBusinessId(sessionData.business.id)
setBusinessName(sessionData.business.businessName)
setPackages(packagesData.packages || [])
setPrintPackages((printPackagesData.printPackages || []).filter((pkg) => pkg.isActive))
setDestinations(destinationsData.destinations || [])
setPublications((publicationsData.publications || []).filter((pub) => pub.isPublished))
        if (subStatusData.hasSubscription) {
          setExistingSubscription(subStatusData.subscription)
          setSelected(subStatusData.subscription.packageType)
          setPackageId(subStatusData.subscription.packageId)
          setHasPaid(true)
        }
      } catch (err) {
        console.error('LOAD ERROR:', err)
        setError('Could not load your account. Try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const selectedOption = OPTIONS.find((o) => o.id === selected)
  const needsPackage = selected === 'digital_partner' || selected === 'directory_listing' || selected === 'digital_partner_advertiser' || selected === 'advertiser'
  const needsDestination = selected === 'digital_partner' || selected === 'directory_listing' || selected === 'digital_partner_advertiser'
  const needsPublication = needsDestination
  const multiPublication = needsMultiplePublications(selected)
  
  const regions = destinations.filter((d) => d.level === 'region')
const destinationOptions = destinations.filter(
  (d) => d.level === 'destination' && d.parentId === regionId
)

const filteredPackages =
  selected === 'advertiser'
    ? printPackages
    : packages.filter((pkg) =>
        selected === 'directory_listing'
          ? pkg.packageType === 'directory_listing'
          : pkg.packageType === 'digital_partner'
      )


  function isOptionLocked(optId) {
    return existingSubscription && existingSubscription.packageType !== optId
  }
  


  function togglePublication(id) {
    if (multiPublication) {
      setPublicationIds((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      )
    } else {
      setPublicationIds([id])
    }
  }

  function handlePayNow() {
    if (!packageId) {
      setError('Choose a package before paying.')
      return
    }
    setError(null)
    setShowCardModal(true)
  }
  
  async function handlePaymentMethodReady(paymentMethodId) {
    try {
      const res = await fetch('/api/business/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, packageId, paymentMethodId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start subscription.')
  
      setShowCardModal(false)
      setHasPaid(true)
      setExistingSubscription({
        packageType: selected,
        packageId,
      })

     
      await submitPlan()
    } catch (err) {
      setError(err.message)
      setShowCardModal(false)
    }
  }




  function handlePaymentCancel() {
    setShowCardModal(false)
  }
 

  async function submitPlan() {
    if (!selected) return
    if (needsPublication && publicationIds.length === 0) {
      setError('Choose a publication to continue.')
      return
    }
  
    if (needsDestination && destinationIds.length === 0) {
      setError('Choose at least one destination to continue.')
      return
    }


    if (needsPackage && !packageId) {
      setError('Choose a digital package to continue.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/business/select-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          option: selected,
          packageId,
          destinationIds,
          publicationIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      if (selected === 'advertiser') {
        router.push('/business/advertiserdashboard')
      } else if (selected === 'directory_listing') {
        router.push('/business/listingdashboard')
      } else {
        router.push('/business/dashboard')
      }
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  async function handleConfirm() {
    await submitPlan()
  }

  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Loading your account…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
          Welcome{businessName ? `, ${businessName}` : ''}
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-[#0b1830] sm:text-4xl">
          How do you want to appear?
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
          Pick one placement to start with. You can add the others later from your dashboard.
        </p>

        {error && (
          <div className="mt-6 border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
  const isSelected = selected === opt.id
  const locked = isOptionLocked(opt.id)
  return (
    <button
      key={opt.id}
      type="button"
      disabled={locked}
      onClick={() => {
        if (locked) return

        setSelected(opt.id)
        setRegionId(null)
        setDestinationIds([])
        setPublicationIds(publications.length === 1 ? [publications[0].id] : [])
        setError('')
      
        if (existingSubscription && existingSubscription.packageType === opt.id) {
          setPackageId(existingSubscription.packageId)
          setHasPaid(true)
        } else {
          setPackageId(null)
          setHasPaid(false)
        }
      }}
      className={`relative rounded-lg border px-5 py-5 text-left transition
        ${locked
          ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
          : isSelected
            ? 'border-[#2f7d1b] bg-[#edf6e5] ring-4 ring-[#2f7d1b]/10'
            : 'border-slate-200 hover:border-[#2f7d1b]/40'}`}
    >
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                  {opt.tag}
                </span>
                <h2 className="mt-2 font-serif text-xl leading-snug tracking-tight text-[#0b1830]">
                  {opt.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {opt.description}
                </p>
                <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-500">
                  {opt.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7d1b] text-white">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M1.5 6.2L4.6 9.3L10.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {needsPublication && (
          <div className="mt-8 border-t border-slate-200 pt-8">
            <p className="text-xs font-bold text-[#0b1830]">
              Choose your publication{multiPublication ? '(s)' : ''}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {multiPublication
                ? 'Select every publication you want to appear in.'
                : 'Select the publication your listing belongs to.'}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {publications.length === 0 && (
                <p className="text-sm text-slate-500">No publications are available right now.</p>
              )}
              {publications.map((pub) => (
                <button
                  key={pub.id}
                  type="button"
                  onClick={() => togglePublication(pub.id)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-normal transition
                    ${publicationIds.includes(pub.id)
                      ? 'border-[#2f7d1b] bg-[#edf6e5] text-[#0b1830]'
                      : 'border-slate-200 text-slate-600 hover:border-[#2f7d1b]/40'}`}
                >
                  <span className="font-bold text-[#0b1830]">{pub.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

{needsDestination && (
  <div className="mt-8 border-t border-slate-200 pt-8">
    <p className="text-xs font-bold text-[#0b1830]">
      Choose your destination
    </p>
    <p className="mt-1 text-sm text-slate-500">
      Where should your business appear?
    </p>

    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="text-xs font-bold text-slate-500">Region</label>
        <select
          value={regionId || ''}
          onChange={(e) => {
            setRegionId(e.target.value || null)
            setDestinationIds([])
          }}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
        >
          <option value="">Select a region…</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {regions.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">No regions are available right now.</p>
        )}
      </div>

      <div>
  <label className="text-xs font-bold text-slate-500">Destination(s)</label>
  {!regionId && (
    <p className="mt-1 text-sm text-slate-500">Choose a region first.</p>
  )}
  {regionId && destinationOptions.length === 0 && (
    <p className="mt-1 text-sm text-slate-500">No destinations in this region yet.</p>
  )}
  {regionId && destinationOptions.length > 0 && (
    <div className="mt-1 flex flex-wrap gap-2">
      {destinationOptions.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() =>
            setDestinationIds((prev) =>
              prev.includes(d.id) ? prev.filter((id) => id !== d.id) : [...prev, d.id]
            )
          }
          className={`rounded-lg border px-3 py-2 text-left text-sm font-normal transition
            ${destinationIds.includes(d.id)
              ? 'border-[#2f7d1b] bg-[#edf6e5] text-[#0b1830]'
              : 'border-slate-200 text-slate-600 hover:border-[#2f7d1b]/40'}`}
        >
          {d.name}
        </button>
      ))}
    </div>
  )}
</div>
    </div>
  </div>
)}


{needsPackage && (
  <div className="mt-8 border-t border-slate-200 pt-8">
   <p className="text-xs font-bold text-[#0b1830]">
  Choose a{' '}
  {selected === 'directory_listing'
    ? 'directory listing'
    : selected === 'advertiser'
    ? 'print'
    : 'digital'}{' '}
  package
</p>
    <p className="mt-1 text-sm text-slate-500">Required for {selectedOption.title}.</p>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {filteredPackages.length === 0 && (
        <p className="text-sm text-slate-500">No packages are available right now.</p>
      )}
  
  {filteredPackages.map((pkg) => {
  const hasDiscount =
    pkg.discountedPriceCents != null &&
    pkg.priceCents != null &&
    pkg.discountedPriceCents < pkg.priceCents
  const offCents = hasDiscount ? pkg.priceCents - pkg.discountedPriceCents : 0
  const offPercent = hasDiscount ? Math.round((offCents / pkg.priceCents) * 100) : 0

  const entitlementList = Array.isArray(pkg.entitlements)
    ? pkg.entitlements
    : pkg.entitlements && typeof pkg.entitlements === 'object'
    ? Object.entries(pkg.entitlements)
        .filter(([, v]) => v)
        .map(([k, v]) =>
          typeof v === 'string'
            ? v
            : k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
        )
    : []

  return (
    <button
      key={pkg.id}
      type="button"
      onClick={() => setPackageId(pkg.id)}
      className={`relative rounded-lg border px-4 py-3 text-left text-sm transition
        ${packageId === pkg.id
          ? 'border-[#2f7d1b] bg-[#edf6e5]'
          : 'border-slate-200 hover:border-[#2f7d1b]/40'}`}
    >
      {hasDiscount && (
        <span className="absolute right-2 top-2 rounded-full bg-[#2f7d1b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          ${(offCents / 100).toFixed(0)} off
        </span>
      )}
          <p className="font-bold text-[#0b1830]">{pkg.name}</p>
      {pkg.description && (
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{pkg.description}</p>
      )}
      {pkg.priceCents != null && (
        <div className="mt-0.5 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <p className="font-bold text-[#2f7d1b]">
                ${(pkg.discountedPriceCents / 100).toFixed(0)}
                {pkg.billingInterval ? ` / ${pkg.billingInterval}` : ''}
              </p>
              <p className="text-slate-400 line-through">
                ${(pkg.priceCents / 100).toFixed(0)}
              </p>
              <p className="text-[11px] font-semibold text-[#2f7d1b]">
                {offPercent}% off
              </p>
            </>
          ) : (
            <p className="text-slate-500">
              ${(pkg.priceCents / 100).toFixed(0)}{pkg.billingInterval ? ` / ${pkg.billingInterval}` : ''}
            </p>
          )}
        </div>
      )}

      {entitlementList.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
          {entitlementList.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </button>
  )
})}
            </div>
          </div>
        )}

{!hasPaid ? (
  <button
    type="button"
    onClick={handlePayNow}
    disabled={!selected || !packageId}
    className="mt-10 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515] disabled:opacity-60 sm:w-auto sm:px-8"
  >
    Pay now
  </button>
) : (
  <button
    type="button"
    onClick={handleConfirm}
    disabled={!selected || submitting}
    className="mt-10 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515] disabled:opacity-60 sm:w-auto sm:px-8"
  >
    {submitting ? 'Setting up your account…' : 'Confirm and continue'}
  </button>
)}

{showCardModal && (
  <StripeCardModal
  pkg={filteredPackages.find((p) => p.id === packageId)}
  onPaymentMethodReady={handlePaymentMethodReady}
  onCancel={handlePaymentCancel}
/>
)}
      </div>
    </div>
  )
}

// components/StripeCardModal.jsx
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function getEntitlementList(entitlements) {
  let value = entitlements

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }

  if (Array.isArray(value)) return value

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, v]) => v === true || (typeof v === 'string' && v.length > 0))
      .map(([k, v]) =>
        typeof v === 'string'
          ? v
          : k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
      )
  }

  return []
}

function PackageSummary({ pkg }) {
  if (!pkg) return null
  console.log('entitlements type:', typeof pkg.entitlements, pkg.entitlements)
  const hasDiscount =
    pkg.discountedPriceCents != null &&
    pkg.priceCents != null &&
    pkg.discountedPriceCents < pkg.priceCents
  const displayCents = hasDiscount ? pkg.discountedPriceCents : pkg.priceCents
  const entitlementList = getEntitlementList(pkg.entitlements)

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-lg leading-tight tracking-tight text-[#0b1830]">
          {pkg.name}
        </p>
        {pkg.priceCents != null && (
          <div className="shrink-0 text-right">
            <p className="font-bold text-[#2f7d1b]">
              ${(displayCents / 100).toFixed(0)}
              {pkg.billingInterval ? (
                <span className="text-xs font-semibold text-slate-400"> / {pkg.billingInterval}</span>
              ) : null}
            </p>
            {hasDiscount && (
              <p className="text-xs text-slate-400 line-through">
                ${(pkg.priceCents / 100).toFixed(0)}
              </p>
            )}
          </div>
        )}
      </div>

      {pkg.description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{pkg.description}</p>
      )}

      {entitlementList.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-600">
          {entitlementList.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#2f7d1b]" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CheckoutForm({ onPaymentMethodReady, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!stripe || !elements || processing) return

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (stripeError) {
      setProcessing(false)
      setError(stripeError.message || 'Could not process card. Please try again.')
      return
    }

    await onPaymentMethodReady(paymentMethod.id)
    setProcessing(false)
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '15px',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: '#0b1830',
        letterSpacing: '0.02em',
        '::placeholder': { color: '#94a3b8' },
      },
      invalid: { color: '#dc2626' },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Card details
        </label>
        <div
          className={`rounded-xl border bg-white px-4 py-3.5 shadow-sm transition
            ${error
              ? 'border-red-300 ring-4 ring-red-50'
              : cardComplete
              ? 'border-[#2f7d1b]/40 ring-4 ring-[#2f7d1b]/5'
              : 'border-slate-200 focus-within:border-[#2f7d1b]/50 focus-within:ring-4 focus-within:ring-[#2f7d1b]/5'}`}
        >
          <CardElement
            options={cardElementOptions}
            onChange={(e) => {
              setCardComplete(e.complete)
              if (error) setError(null)
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border-l-4 border-red-400 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <LockIcon />
        Payments are securely processed by Stripe.
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-[#2f7d1b] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#246515] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing && <Spinner />}
          {processing ? 'Processing…' : 'Pay now'}
        </button>
      </div>
    </form>
  )
}

export default function StripeCardModal({ pkg, onPaymentMethodReady, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1830]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="border-b border-slate-100 px-6 pb-5 pt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
            Secure checkout
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight tracking-tight text-[#0b1830]">
            Complete your payment
          </h2>
        </div>

        <div className="px-6 py-6">
          <PackageSummary pkg={pkg} />
          <Elements stripe={stripePromise}>
            <CheckoutForm onPaymentMethodReady={onPaymentMethodReady} onCancel={onCancel} />
          </Elements>
        </div>
      </div>
    </div>
  )
}
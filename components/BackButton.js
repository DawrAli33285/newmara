'use client'

import Link from 'next/link'

export default function BackButton() {
  return (
    <Link href="/account" className="text-sm text-blue-600 hover:underline">
      ← Back
    </Link>
  )
}
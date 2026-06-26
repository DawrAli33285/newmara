'use client'

import { useState } from 'react'

export default function CopyButton({ url }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
    >
      {copied ? '✓ Copied!' : 'Copy link'}
    </button>
  )
}
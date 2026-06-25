'use client'

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-sm text-blue-600 hover:underline"
    >
      ← Back
    </button>
  )
}
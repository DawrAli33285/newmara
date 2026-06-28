'use client'

import { useState } from 'react'

export default function PublishToggle({ id, isPublished: initial }) {
  const [isPublished, setIsPublished] = useState(initial)

  const toggle = async () => {
    const res = await fetch(`/api/admin/publications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !isPublished }),
    })
    if (res.ok) setIsPublished(!isPublished)
  }

  return (
    <button
      onClick={toggle}
      className={`mt-2 w-full text-sm py-2 rounded-lg transition-colors ${
        isPublished ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`}
    >
      {isPublished ? 'Unpublish' : 'Publish'}
    </button>
  )
}
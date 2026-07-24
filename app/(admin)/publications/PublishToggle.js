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
      className="mt-2 w-full rounded-lg py-2 text-sm font-medium transition"
      style={
        isPublished
          ? { backgroundColor: '#FBEAE9', color: '#B3261E' }
          : { backgroundColor: '#EFF5EE', color: '#2F7D1B' }
      }
    >
      {isPublished ? 'Unpublish' : 'Publish'}
    </button>
  )
}
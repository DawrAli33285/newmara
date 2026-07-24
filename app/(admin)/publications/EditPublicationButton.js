'use client'

import { useState } from 'react'
import EditPublicationModal from './EditPublicationModal'

export default function EditPublicationButton({ publication }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-lg border py-2 text-sm font-medium transition hover:bg-gray-50"
        style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
      >
        Edit
      </button>
      {open && (
        <EditPublicationModal publication={publication} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
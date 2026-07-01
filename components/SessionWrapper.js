'use client'

import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

function DeviceGuard({ children }) {
  const { data: session } = useSession()
  const [conflict, setConflict] = useState(false)

  useEffect(() => {
    if (session?.error === 'device_conflict') {
      setConflict(true)
    }
  }, [session])

  if (conflict) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Session Ended</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your account has been signed in on another device. Please log in again to continue reading.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full bg-[#2B3FCC] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      <DeviceGuard>{children}</DeviceGuard>
    </SessionProvider>
  )
}
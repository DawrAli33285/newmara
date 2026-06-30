'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const linkClass = `text-sm font-medium transition-colors hover:opacity-70 text-white`

  return (
    <header className="top-0 left-0 right-0 z-50 bg-[#2B3FCC]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold tracking-tight text-white">
            Mara Media
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#publications" className={linkClass}>Publications</Link>
          <Link href="/#about" className={linkClass}>About</Link>
          <Link href="/#pricing" className={linkClass}>Pricing</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link href={isAdmin ? '/dashboard' : '/account'} className={linkClass}>
                {isAdmin ? 'Dashboard' : 'My Account'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass}>Login</Link>
              <Link
                href="/#publications"
                className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors shadow-sm"
              >
                Subscribe
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#2B3FCC] border-t border-blue-800">
          <div className="flex flex-col px-6 py-4 gap-4">
            <Link href="/#publications" className="text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>Publications</Link>
            <Link href="/#about" className="text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/#pricing" className="text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>Pricing</Link>
            {session ? (
              <>
                <Link href={isAdmin ? '/dashboard' : '/account'} className="text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>
                  {isAdmin ? 'Dashboard' : 'My Account'}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-500 text-white text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/subscribe" className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-500 text-white text-center" onClick={() => setMenuOpen(false)}>Subscribe</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
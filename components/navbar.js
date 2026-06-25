'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const linkClass = `text-sm font-medium transition-colors hover:opacity-70 ${scrolled ? 'text-gray-700' : 'text-white'}`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex-shrink-0">
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
            scrolled ? 'text-gray-900' : 'text-white'
          }`}>
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
              <Link href="/account" className={linkClass}>My Account</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass}>Login</Link>
              <Link
                href="/subscribe"
                className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
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
          <span className={`block w-5 h-0.5 transition-all ${scrolled ? 'bg-gray-900' : 'bg-white'}`} />
          <span className={`block w-5 h-0.5 transition-all ${scrolled ? 'bg-gray-900' : 'bg-white'}`} />
          <span className={`block w-5 h-0.5 transition-all ${scrolled ? 'bg-gray-900' : 'bg-white'}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="flex flex-col px-6 py-4 gap-4">
            <Link href="/#publications" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Publications</Link>
            <Link href="/#about" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/#pricing" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Pricing</Link>
            {session ? (
              <>
                <Link href="/account" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>My Account</Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-600 text-white text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/subscribe" className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-600 text-white text-center" onClick={() => setMenuOpen(false)}>Subscribe</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import logo from '../public/logo.png'
import Image from 'next/image'
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const showLibrary = !!session && !isAdmin
  const pathname = usePathname()
  const navLinks = [
    { label: 'Publications', href: '/browse' },
    { label: 'Advertise',    href: '/advertise' },
    { label: 'About',        href: '/about' },
  ]

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-[#D9E0E7]">
      <div className="max-w-360 mx-auto px-6 h-16 flex items-center justify-between relative">
        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
          <Image
            src={logo}
            alt="Mara Media"
            width={100}
            height={100}
            className="rounded-md"
            priority
          />
          <div className="leading-tight">
            <p className="text-[13px] font-bold tracking-wide text-[#081B31]">mara</p>
            <p className="text-[13px] font-bold tracking-wide text-[#081B31]">media</p>
          </div>
          <span className="hidden sm:block text-[12px] font-semibold tracking-wider text-[#657084] uppercase border-l border-[#D9E0E7] pl-3 ml-1">
            Publications
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`text-[15px] font-medium pb-0.5 border-b-2 transition-colors ${
                isActive(href)
                  ? 'text-[#2F7D1B] border-[#2F7D1B]'
                  : 'text-[#0B1830] border-transparent hover:text-[#2F7D1B]'
              }`}
            >
              {label}
            </Link>
          ))}
          {showLibrary && (
            <Link
              href="/library"
              className={`text-[15px] font-medium pb-0.5 border-b-2 transition-colors ${
                isActive('/library')
                  ? 'text-[#2F7D1B] border-[#2F7D1B]'
                  : 'text-[#0B1830] border-transparent hover:text-[#2F7D1B]'
              }`}
            >
              My Library
            </Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/browse"
            className="inline-flex items-center justify-center text-[14px] font-semibold px-5 min-h-[44px] rounded-full bg-[#2F7D1B] text-white hover:bg-[#256315] transition-colors"
          >
            Subscribe
          </Link>

          {session ? (
            <Link
              href={isAdmin ? '/dashboard' : '/account'}
              className="flex items-center gap-1.5 text-[15px] font-medium text-[#0B1830] min-h-[44px] hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {isAdmin ? 'Dashboard' : 'My Account'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-[15px] font-medium text-[#0B1830] min-h-[44px] hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </Link>
          )}
        </div>
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 min-h-[44px] min-w-[44px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 rounded bg-[#081B31]" />
          <span className="block w-5 h-0.5 rounded bg-[#081B31]" />
          <span className="block w-5 h-0.5 rounded bg-[#081B31]" />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#D9E0E7]">
          <div className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`text-[16px] font-medium min-h-[44px] flex items-center ${
                  isActive(href) ? 'text-[#2F7D1B]' : 'text-[#0B1830]'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {showLibrary && (
              <Link
                href="/library"
                className={`text-[16px] font-medium min-h-[44px] flex items-center ${
                  isActive('/library') ? 'text-[#2F7D1B]' : 'text-[#0B1830]'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                My Library
              </Link>
            )}

            <Link
              href="/publications"
              className="inline-flex items-center justify-center text-[15px] font-semibold min-h-[44px] rounded-full bg-[#2F7D1B] text-white mt-2"
              onClick={() => setMenuOpen(false)}
            >
              Subscribe
            </Link>

            <div className="border-t border-[#D9E0E7] pt-4 mt-2">
              {session ? (
                <>
                  <Link
                    href={isAdmin ? '/dashboard' : '/account'}
                    className="flex items-center gap-2 text-[16px] font-medium text-[#0B1830] min-h-[44px]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {isAdmin ? 'Dashboard' : 'My Account'}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-[15px] text-[#657084] mt-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-[16px] font-medium text-[#0B1830] min-h-[44px]"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
import Link from 'next/link'
import logo from '../public/logo.png'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2F7D1B', color: '#FFFFFF' }}>
      <div className="max-w-360 mx-auto px-6 py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg bg-white p-1.5"
              >
                <Image
                  src={logo}
                  alt="Mara Media"
                  width={100}
                  height={100}
                  className="rounded-md"
                  priority
                />
              </div>
              <h3 className="text-lg font-bold">Mara Media</h3>
            </div>
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Ireland's digital magazine platform. Beautiful reading experiences for maritime,
              aviation, business and regional publications.
            </p>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#EFF5EE' }}
            >
              Publications
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <li>
                <Link href="/publications/the-skipper" className="transition hover:text-white">
                  The Skipper
                </Link>
              </li>
              <li>
                <Link href="/publications/take-off" className="transition hover:text-white">
                  Take Off
                </Link>
              </li>
              <li>
                <Link href="/publications/go-west" className="transition hover:text-white">
                  Go West
                </Link>
              </li>
              <li>
                <Link href="/publications/due-south" className="transition hover:text-white">
                  Due South
                </Link>
              </li>
              <li>
                <Link href="/publications/the-business" className="transition hover:text-white">
                  The Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#EFF5EE' }}
            >
              Account
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/publications" className="transition hover:text-white">
                  Subscribe
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition hover:text-white">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm sm:flex-row"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)' }}
        >
          <p>© {new Date().getFullYear()} Mara Media. All rights reserved.</p>
          <p>read.maramedia.ie</p>
        </div>
      </div>
    </footer>
  )
}
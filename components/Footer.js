import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0f1f3d] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-3">Mara Media</h3>
            <p className="text-blue-300 text-sm leading-relaxed max-w-xs">
              Ireland's digital magazine platform. Beautiful reading experiences for maritime,
              aviation, business and regional publications.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-blue-400 mb-4">
              Publications
            </h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/subscribe/the-skipper" className="hover:text-white transition-colors">The Skipper</Link></li>
              <li><Link href="/subscribe/take-off" className="hover:text-white transition-colors">Take Off</Link></li>
              {/* <li><Link href="/subscribe/go-west" className="hover:text-white transition-colors">Go West</Link></li> */}
              <li><Link href="/subscribe/the-business" className="hover:text-white transition-colors">The Business</Link></li>
              <li><Link href="/subscribe/due-south" className="hover:text-white transition-colors">Due South</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-blue-400 mb-4">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="/#publications" className="hover:text-white transition-colors">Subscribe</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-blue-400">
          <p>© {new Date().getFullYear()} Mara Media. All rights reserved.</p>
          <p>read.maramedia.ie</p>
        </div>
      </div>
    </footer>
  )
}
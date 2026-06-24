import Link from 'next/link'

const plans = [
  { title: 'The Skipper', price: '29', period: 'year', note: '12 monthly issues', featured: true },
  { title: 'Take Off', price: '19', period: 'year', note: 'Annual issue', featured: false },
  { title: 'Go West', price: '19', period: 'year', note: 'Annual issue', featured: false },
  { title: 'The Business', price: '19', period: 'year', note: 'Annual issue', featured: false },
  { title: 'Due South', price: '19', period: 'year', note: 'Annual issue', featured: false },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Subscribe to one publication or as many as you like. All include full archive access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.featured
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {plan.featured && (
                <span className="absolute top-4 right-4 text-xs font-bold bg-white text-blue-600 px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}

              <h3 className={`text-xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                {plan.title}
              </h3>
              <p className={`text-sm mb-6 ${plan.featured ? 'text-blue-200' : 'text-gray-400'}`}>
                {plan.note}
              </p>

              <div className="flex items-end gap-1 mb-8">
                <span className={`text-xl font-medium ${plan.featured ? 'text-blue-200' : 'text-gray-400'}`}>€</span>
                <span className={`text-5xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm mb-2 ${plan.featured ? 'text-blue-200' : 'text-gray-400'}`}>
                  /{plan.period}
                </span>
              </div>

              <ul className={`text-sm space-y-2 mb-8 ${plan.featured ? 'text-blue-100' : 'text-gray-500'}`}>
                <li className="flex items-center gap-2"><span>✓</span> Full archive access</li>
                <li className="flex items-center gap-2"><span>✓</span> Desktop, tablet & mobile</li>
                <li className="flex items-center gap-2"><span>✓</span> Interactive flipbook reader</li>
                <li className="flex items-center gap-2"><span>✓</span> Cancel anytime</li>
              </ul>

              <Link
                href="/subscribe"
                className={`block text-center py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  plan.featured
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
const steps = [
    {
      number: '01',
      title: 'Choose your publication',
      description: 'Pick from five Irish magazines — maritime, aviation, business, or regional.',
    },
    {
      number: '02',
      title: 'Subscribe securely',
      description: 'Pay safely online via Stripe. Annual subscription, cancel any time.',
    },
    {
      number: '03',
      title: 'Read instantly',
      description: 'Access your flipbook reader immediately — every issue, every device.',
    },
  ]
  
  export default function HowItWorks() {
    return (
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
  
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Up and reading in minutes</h2>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step) => (
              <div key={step.number} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 text-2xl font-bold mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
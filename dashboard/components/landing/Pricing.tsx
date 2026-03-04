'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const PLANS = [
  {
    name: 'Starter',
    price: '$99',
    period: '/mo',
    desc: 'For small teams processing up to 500 invoices monthly.',
    featured: false,
    cta: 'Get started',
    href: '/dashboard',
    features: [
      'Up to 500 invoices/month',
      'Gmail integration',
      'Veryfi OCR extraction',
      'Trust scoring engine',
      'Slack alerts',
      '7-day history',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '$249',
    period: '/mo',
    desc: 'For growing teams with high invoice volumes.',
    featured: true,
    cta: 'Get started',
    href: '/dashboard',
    features: [
      'Unlimited invoices',
      'Everything in Starter',
      'Custom scoring rules',
      'REST API access',
      '90-day history',
      'Audit log export',
      'Priority support',
      'Priority Slack alerts',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organizations with advanced requirements.',
    featured: false,
    cta: 'Contact us',
    href: 'mailto:hello@invoiceguardian.dev',
    features: [
      'Unlimited everything',
      'Everything in Growth',
      'Dedicated infrastructure',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee',
      'Dedicated account manager',
      'SSO & SAML',
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Simple, transparent pricing
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.featured
                  ? 'bg-gradient-to-b from-blue-600/15 to-violet-600/15 border border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.12)]'
                  : 'glass'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <span className="text-blue-400 shrink-0 mt-0.5 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-200 ${
                  plan.featured
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5'
                    : 'border border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

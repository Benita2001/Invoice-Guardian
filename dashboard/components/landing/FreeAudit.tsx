'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const BULLETS = [
  { icon: '📬', text: 'Scans every invoice email from the last 12 months' },
  { icon: '🧠', text: 'Runs OCR + fraud scoring on each PDF' },
  { icon: '💸', text: 'Shows exactly how much went to suspicious vendors' },
  { icon: '📊', text: 'Breaks down risk by vendor, amount, and tier' },
]

export default function FreeAudit() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-red-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-[0.15em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Free 12-Month Audit
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
              Find out how much<br />
              you&apos;ve{' '}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                already lost
              </span>
            </h2>

            <p className="text-zinc-400 leading-relaxed mb-8">
              Most invoice fraud goes undetected for months. Run a free 12-month audit
              of your Gmail inbox and discover suspicious invoices you may have already paid —
              before the damage compounds.
            </p>

            <ul className="space-y-3 mb-10">
              {BULLETS.map(b => (
                <li key={b.text} className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="text-base shrink-0">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:-translate-y-0.5"
            >
              Run Free 12-Month Audit →
            </Link>
            <p className="text-xs text-zinc-600 mt-3">
              No card required · Reads Gmail read-only · Results in minutes
            </p>
          </motion.div>

          {/* Right: visual card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="glass rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Audit Summary</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Complete
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Invoices scanned', value: '847', color: 'text-white' },
                    { label: 'Suspicious found', value: '23', color: 'text-red-400' },
                    { label: 'Risky vendors', value: '7', color: 'text-orange-400' },
                    { label: 'Paid to suspicious', value: '$48,250', color: 'text-red-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-zinc-600 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top vendors */}
                <div>
                  <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">
                    Top suspicious vendors
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Unknown Vendor', amount: '$24,000', tier: 'CRITICAL', score: 12 },
                      { name: 'QuickBill LLC',  amount: '$15,500', tier: 'HIGH',     score: 28 },
                      { name: 'Fast Invoice Co', amount: '$8,750', tier: 'HIGH',     score: 35 },
                    ].map(v => (
                      <div key={v.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
                            v.tier === 'CRITICAL'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          }`}>
                            {v.tier}
                          </span>
                          <span className="text-sm text-zinc-300">{v.name}</span>
                        </div>
                        <span className="text-sm font-bold text-red-400">{v.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

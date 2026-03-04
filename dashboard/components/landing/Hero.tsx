'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, #0a0a0a 100%)' }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] rounded-full bg-blue-600/10 blur-[140px] orb-a pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[140px] orb-b pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-[0.18em] mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Pipeline Active
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-7xl lg:text-[86px] font-extrabold text-white leading-[0.95] tracking-tight mb-6"
        >
          Stop fraudulent<br />
          invoices{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            before
          </span>
          <br />
          they&apos;re paid
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Invoice Guardian watches your Gmail, extracts data from every PDF via OCR,
          runs 10+ fraud-detection rules, and alerts your team on Slack — all automatically.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
          >
            Open Dashboard →
          </Link>
          <a
            href="#features"
            className="px-8 py-3.5 rounded-xl border border-white/10 text-zinc-300 font-semibold text-sm hover:border-white/25 hover:text-white transition-all duration-300"
          >
            See how it works
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center justify-center gap-10 mt-24 pt-8 border-t border-white/[0.05]"
        >
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const STATS = [
  { value: '10+',  label: 'Fraud signals' },
  { value: '<60s', label: 'Detection time' },
  { value: '100%', label: 'Automated' },
  { value: '$0',   label: 'Manual work' },
]

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const TIERS = [
  { name: 'LOW',      range: '70–100', desc: 'Proceed with payment',  color: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', bar: 100 },
  { name: 'MEDIUM',   range: '40–69',  desc: 'Worth a second look',   color: '#eab308', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  text: 'text-yellow-400',  bar: 69  },
  { name: 'HIGH',     range: '20–39',  desc: 'Multiple red flags',    color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', bar: 39  },
  { name: 'CRITICAL', range: '0–19',   desc: 'Do not pay',            color: '#ef4444', bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400',    bar: 19  },
]

const SAMPLE_FLAGS = [
  { rule: 'missing_vendor',         pts: 25, detail: 'Vendor name is missing or unrecognised' },
  { rule: 'high_amount',            pts: 20, detail: 'Unusually high total: $50,000.00' },
  { rule: 'missing_invoice_number', pts: 15, detail: 'No invoice number found on document' },
  { rule: 'missing_line_items',     pts: 15, detail: 'Invoice has no line items' },
]

function AnimatedCounter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * to))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to])

  return <span ref={ref}>{value}</span>
}

export default function TrustScore() {
  return (
    <section id="trust-score" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-violet-400 uppercase tracking-[0.2em] mb-3"
          >
            Trust Scoring
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4"
          >
            Scores, not guesswork
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 max-w-xl mx-auto"
          >
            Every invoice starts at 100. Fraud signals deduct points with clear explanations.
            No black boxes.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: counter + tiers */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass rounded-3xl p-8 mb-6 text-center"
            >
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">Sample trust score</div>
              <div className="text-[96px] font-extrabold leading-none bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                <AnimatedCounter to={85} />
              </div>
              <div className="text-zinc-600 text-sm mt-1">/ 100</div>
              <div className="inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold tracking-wider">LOW RISK</span>
              </div>
            </motion.div>

            <div className="space-y-3">
              {TIERS.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`flex items-center gap-4 p-3 rounded-xl border ${tier.bg} ${tier.border}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${tier.text}`}>{tier.name}</span>
                      <span className="text-xs text-zinc-600 font-mono">{tier.range}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tier.bar}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">{tier.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: sample card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-xs text-zinc-600 font-mono mb-3 uppercase tracking-widest">// example flagged invoice</div>
            <div className="glass rounded-2xl border-l-4 border-l-red-500 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Unknown Vendor</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">CRITICAL</span>
                    </div>
                    <div className="text-xs text-zinc-600 mt-1 font-mono">#N/A · $50,000.00 · Jan 15, 2026</div>
                  </div>
                  <div className="text-right drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                    <div className="text-3xl font-extrabold text-red-400 leading-none">15</div>
                    <div className="text-xs text-zinc-600">/ 100 trust</div>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-white/[0.05]">
                  {SAMPLE_FLAGS.map(f => (
                    <div key={f.rule} className="flex items-start gap-2 text-xs">
                      <span className="shrink-0 font-mono px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">-{f.pts}</span>
                      <span className="text-zinc-400">
                        <span className="text-zinc-200 font-medium">{f.rule}</span> — {f.detail}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.05]">
                  <button className="px-3 py-1.5 bg-emerald-600/80 text-white text-xs font-bold rounded-lg">✓ Approve</button>
                  <button className="px-3 py-1.5 bg-red-600/80 text-white text-xs font-bold rounded-lg">✗ Block</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

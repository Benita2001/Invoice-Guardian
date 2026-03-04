'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: "Invoice Guardian caught 3 fraudulent invoices in our first week. The trust scoring is incredibly accurate — we haven't missed a single red flag since deploying it.",
    name: 'Sarah K.',
    role: 'CFO',
    company: 'TechFlow Inc.',
    initials: 'SK',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    quote: "We process hundreds of invoices monthly. This has cut our manual review time by 90%. The Slack integration means our team can act from anywhere, instantly.",
    name: 'Marcus R.',
    role: 'Finance Director',
    company: 'BuildCo Group',
    initials: 'MR',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    quote: "The fraud signal explanations are crystal clear. We know exactly why an invoice was flagged, which makes it easy to train the team and tighten our policies.",
    name: 'Priya M.',
    role: 'Financial Controller',
    company: 'Nexus Labs',
    initials: 'PM',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

export default function Testimonials() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Trusted by finance teams
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05]">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.role} · {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    icon: '📬',
    title: 'Gmail Polling',
    description: 'Scans your inbox every 60 seconds for PDF invoice attachments. No manual uploads needed.',
    tag: 'Gmail API + OAuth2',
  },
  {
    icon: '🔍',
    title: 'OCR Extraction',
    description: 'Veryfi extracts vendor names, invoice numbers, totals, and line items from every PDF.',
    tag: 'Powered by Veryfi',
  },
  {
    icon: '🧠',
    title: 'Trust Scoring',
    description: '10+ fraud-detection rules score each invoice 0–100. Every flag deducts points with a reason.',
    tag: 'Custom rule engine',
  },
  {
    icon: '💬',
    title: 'Slack Alerts',
    description: 'Your team gets instant Slack messages with one-click Approve or Block buttons.',
    tag: 'Slack Bolt',
  },
]

export default function HowItWorks() {
  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Four steps, fully automated
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 relative cursor-default group"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/30">
                {i + 1}
              </div>

              <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">{step.description}</p>
              <div className="inline-flex items-center text-xs text-blue-400/60 font-mono border border-blue-400/15 bg-blue-400/5 px-2 py-1 rounded-md">
                {step.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

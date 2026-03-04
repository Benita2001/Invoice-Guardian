'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.05]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-lg">🛡️</span>
          <span className="font-bold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors duration-200">
            Invoice Guardian
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[['Features', '#features'], ['Trust Score', '#trust-score'], ['Pricing', '#pricing']].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="text-sm font-bold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        >
          Dashboard →
        </Link>
      </div>
    </motion.header>
  )
}

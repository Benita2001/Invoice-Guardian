import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.05] px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span>🛡️</span>
          <span className="font-bold text-white text-sm">Invoice Guardian</span>
          <span className="text-zinc-700 text-sm">— AI-powered invoice fraud detection</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xs text-zinc-600 hover:text-white transition-colors">Dashboard</Link>
          <a href="#features" className="text-xs text-zinc-600 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-xs text-zinc-600 hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="text-xs text-zinc-700">
          © {new Date().getFullYear()} Invoice Guardian. Built with Next.js &amp; Supabase.
        </div>
      </div>
    </footer>
  )
}

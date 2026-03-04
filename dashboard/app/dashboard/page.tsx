import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DashboardTabs from '@/components/DashboardTabs'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('is_historical', false)
    .order('created_at', { ascending: false })
    .limit(100)

  const all = invoices ?? []
  const pending = all.filter(i => !i.decision).length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] backdrop-blur-xl bg-[#0a0a0a]/80 px-6">
        <div className="max-w-5xl mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span>🛡️</span>
              <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                Invoice Guardian
              </span>
            </Link>
            <span className="text-white/15">/</span>
            <span className="text-zinc-500 text-sm font-medium">Dashboard</span>
          </div>

          {pending > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {pending} awaiting review
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <DashboardTabs initialInvoices={all} />
      </div>
    </div>
  )
}

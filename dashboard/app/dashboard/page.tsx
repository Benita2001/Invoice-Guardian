import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import InvoiceList from '@/components/InvoiceList'

export const dynamic = 'force-dynamic'

const STAT_STYLES: Record<string, string> = {
  slate:  'border-white/[0.07] text-white',
  red:    'border-red-500/30 text-red-400',
  orange: 'border-orange-500/30 text-orange-400',
  yellow: 'border-yellow-500/30 text-yellow-400',
  green:  'border-emerald-500/30 text-emerald-400',
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`glass rounded-xl p-4 border ${STAT_STYLES[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold mt-0.5 opacity-40 uppercase tracking-widest">{label}</div>
    </div>
  )
}

export default async function DashboardPage() {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const all = invoices ?? []
  const counts = {
    total:    all.length,
    critical: all.filter(i => i.risk_tier === 'CRITICAL').length,
    high:     all.filter(i => i.risk_tier === 'HIGH').length,
    medium:   all.filter(i => i.risk_tier === 'MEDIUM').length,
    low:      all.filter(i => i.risk_tier === 'LOW').length,
    pending:  all.filter(i => !i.decision).length,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Fixed background grid */}
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

          {counts.pending > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {counts.pending} awaiting review
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          <StatCard label="Total"    value={counts.total}    color="slate"  />
          <StatCard label="Critical" value={counts.critical} color="red"    />
          <StatCard label="High"     value={counts.high}     color="orange" />
          <StatCard label="Medium"   value={counts.medium}   color="yellow" />
          <StatCard label="Low"      value={counts.low}      color="green"  />
        </div>

        {error && (
          <div className="glass border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400">
            Failed to load invoices: {error.message}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-violet-600" />
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
            Invoices — newest first
          </span>
        </div>

        <InvoiceList initialInvoices={all} />
      </div>
    </div>
  )
}

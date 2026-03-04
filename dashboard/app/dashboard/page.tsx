import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import InvoiceList from '@/components/InvoiceList'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <span className="text-xl">🛡️</span>
              <span className="font-bold text-gray-900">Invoice Guardian</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 text-sm font-medium">Dashboard</span>
          </div>
          {counts.pending > 0 && (
            <span className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {counts.pending} awaiting review
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          <StatCard label="Total"    value={counts.total}    color="slate"  />
          <StatCard label="Critical" value={counts.critical} color="red"    />
          <StatCard label="High"     value={counts.high}     color="orange" />
          <StatCard label="Medium"   value={counts.medium}   color="yellow" />
          <StatCard label="Low"      value={counts.low}      color="green"  />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
            Failed to load invoices: {error.message}
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Invoices — newest first
        </h2>

        <InvoiceList initialInvoices={all} />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const styles: Record<string, string> = {
    slate:  'bg-white border-gray-200 text-gray-800',
    red:    'bg-red-50 border-red-200 text-red-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green:  'bg-green-50 border-green-200 text-green-700',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${styles[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold mt-0.5 opacity-60 uppercase tracking-wide">{label}</div>
    </div>
  )
}

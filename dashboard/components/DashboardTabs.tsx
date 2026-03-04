'use client'

import { useState } from 'react'
import InvoiceList from './InvoiceList'
import AuditTab from './AuditTab'
import { Invoice } from './InvoiceCard'

type Tab = 'invoices' | 'audit'

const TIER_STYLES: Record<string, string> = {
  slate:  'border-white/[0.07] text-white',
  red:    'border-red-500/30 text-red-400',
  orange: 'border-orange-500/30 text-orange-400',
  yellow: 'border-yellow-500/30 text-yellow-400',
  green:  'border-emerald-500/30 text-emerald-400',
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`glass rounded-xl p-4 border ${TIER_STYLES[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold mt-0.5 opacity-40 uppercase tracking-widest">{label}</div>
    </div>
  )
}

export default function DashboardTabs({
  initialInvoices,
}: {
  initialInvoices: Invoice[]
}) {
  const [tab, setTab] = useState<Tab>('invoices')

  const all = initialInvoices
  const counts = {
    total:    all.length,
    critical: all.filter(i => i.risk_tier === 'CRITICAL').length,
    high:     all.filter(i => i.risk_tier === 'HIGH').length,
    medium:   all.filter(i => i.risk_tier === 'MEDIUM').length,
    low:      all.filter(i => i.risk_tier === 'LOW').length,
  }

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 p-1 glass rounded-xl w-fit">
        {([['invoices', '📥 Invoices'], ['audit', '🔍 Historical Audit']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === key
                ? 'bg-white/10 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <>
          <div className="grid grid-cols-5 gap-3 mb-6">
            <StatCard label="Total"    value={counts.total}    color="slate"  />
            <StatCard label="Critical" value={counts.critical} color="red"    />
            <StatCard label="High"     value={counts.high}     color="orange" />
            <StatCard label="Medium"   value={counts.medium}   color="yellow" />
            <StatCard label="Low"      value={counts.low}      color="green"  />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-violet-600" />
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
              Invoices — newest first
            </span>
          </div>

          <InvoiceList initialInvoices={all} />
        </>
      )}

      {tab === 'audit' && <AuditTab />}
    </>
  )
}

'use client'

import { useState } from 'react'

export interface Invoice {
  id: string
  created_at: string
  vendor_name: string | null
  invoice_number: string | null
  invoice_date: string | null
  total: number | null
  currency_code: string | null
  risk_score: number
  risk_tier: string
  risk_flags: Array<{ rule: string; detail: string; points: number }>
  decision: string | null
  reviewed_by: string | null
  reviewed_at: string | null
}

const TIER: Record<string, { border: string; badge: string; score: string; glow: string }> = {
  LOW: {
    border: 'border-l-emerald-500',
    badge:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    score:  'text-emerald-400',
    glow:   'drop-shadow-[0_0_14px_rgba(34,197,94,0.55)]',
  },
  MEDIUM: {
    border: 'border-l-yellow-400',
    badge:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    score:  'text-yellow-400',
    glow:   'drop-shadow-[0_0_14px_rgba(234,179,8,0.55)]',
  },
  HIGH: {
    border: 'border-l-orange-500',
    badge:  'bg-orange-500/10 text-orange-400 border-orange-500/30',
    score:  'text-orange-400',
    glow:   'drop-shadow-[0_0_14px_rgba(249,115,22,0.55)]',
  },
  CRITICAL: {
    border: 'border-l-red-500',
    badge:  'bg-red-500/10 text-red-400 border-red-500/30',
    score:  'text-red-400',
    glow:   'drop-shadow-[0_0_14px_rgba(239,68,68,0.55)]',
  },
}

function fmt(total: number | null, currency: string | null) {
  if (total == null) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(total)
}

function fmtDate(str: string | null) {
  if (!str) return 'N/A'
  try {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return str
  }
}

export default function InvoiceCard({
  invoice,
  onDecision,
}: {
  invoice: Invoice
  onDecision: (id: string, decision: string) => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [decision, setDecision] = useState(invoice.decision)

  const tier = TIER[invoice.risk_tier] ?? TIER.CRITICAL
  const flags = invoice.risk_flags ?? []

  const handleAction = async (action: 'Approved' | 'Blocked') => {
    setLoading(action)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: action }),
      })
      if (res.ok) {
        setDecision(action)
        onDecision(invoice.id, action)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className={`glass rounded-xl border-l-4 ${tier.border} transition-all duration-300 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">
                {invoice.vendor_name ?? 'Unknown Vendor'}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tier.badge}`}>
                {invoice.risk_tier}
              </span>
              {decision && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  decision === 'Approved'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                }`}>
                  {decision === 'Approved' ? '✓ Approved' : '✗ Blocked'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-600 flex-wrap font-mono">
              <span>#{invoice.invoice_number ?? 'N/A'}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-300">{fmt(invoice.total, invoice.currency_code)}</span>
              <span className="text-zinc-700">·</span>
              <span>{fmtDate(invoice.invoice_date ?? invoice.created_at)}</span>
            </div>
          </div>

          {/* Trust score */}
          <div className={`text-right shrink-0 ${tier.glow}`}>
            <div className={`text-3xl font-extrabold leading-none ${tier.score}`}>
              {invoice.risk_score}
            </div>
            <div className="text-xs text-zinc-700 mt-0.5">/ 100 trust</div>
          </div>
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/[0.05]">
            <div className="text-xs font-bold text-zinc-700 uppercase tracking-widest mb-2.5">
              {flags.length} flag{flags.length !== 1 ? 's' : ''}
            </div>
            <ul className="space-y-1.5">
              {flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 font-mono px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                    -{flag.points}
                  </span>
                  <span className="text-zinc-400">
                    <span className="text-zinc-200 font-medium">{flag.rule}</span>
                    {' '}— {flag.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-3">
          {decision ? (
            <p className="text-xs text-zinc-700 font-mono">{decision} · by Dashboard</p>
          ) : (
            <>
              <button
                onClick={() => handleAction('Approved')}
                disabled={!!loading}
                className="px-4 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(34,197,94,0.35)]"
              >
                {loading === 'Approved' ? 'Saving…' : '✓ Approve'}
              </button>
              <button
                onClick={() => handleAction('Blocked')}
                disabled={!!loading}
                className="px-4 py-1.5 bg-red-600/80 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(239,68,68,0.35)]"
              >
                {loading === 'Blocked' ? 'Saving…' : '✗ Block'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

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

const TIER: Record<string, { border: string; badge: string; score: string; dot: string }> = {
  LOW:      { border: 'border-l-green-500',  badge: 'bg-green-100 text-green-800',   score: 'text-green-600',  dot: 'bg-green-500'  },
  MEDIUM:   { border: 'border-l-yellow-400', badge: 'bg-yellow-100 text-yellow-800', score: 'text-yellow-600', dot: 'bg-yellow-400' },
  HIGH:     { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-800', score: 'text-orange-600', dot: 'bg-orange-500' },
  CRITICAL: { border: 'border-l-red-500',    badge: 'bg-red-100 text-red-800',       score: 'text-red-600',    dot: 'bg-red-500'    },
}

function formatDate(str: string | null): string {
  if (!str) return 'N/A'
  try {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return str
  }
}

function formatAmount(total: number | null, currency: string | null): string {
  if (total == null) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(total)
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
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${tier.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-6">

        {/* Top row */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900">
                {invoice.vendor_name ?? 'Unknown Vendor'}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badge}`}>
                {invoice.risk_tier}
              </span>
              {decision && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  decision === 'Approved'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {decision === 'Approved' ? '✓ Approved' : '✗ Blocked'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500 flex-wrap">
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                #{invoice.invoice_number ?? 'N/A'}
              </span>
              <span className="font-medium text-gray-700">
                {formatAmount(invoice.total, invoice.currency_code)}
              </span>
              <span className="text-gray-300">·</span>
              <span>{formatDate(invoice.invoice_date ?? invoice.created_at)}</span>
            </div>
          </div>

          {/* Trust score */}
          <div className="text-right shrink-0">
            <div className={`text-3xl font-bold leading-none ${tier.score}`}>
              {invoice.risk_score}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">/ 100 trust</div>
          </div>
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              {flags.length} Flag{flags.length !== 1 ? 's' : ''}
            </p>
            <ul className="space-y-1.5">
              {flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 font-mono text-xs bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded mt-0.5">
                    -{flag.points}
                  </span>
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-800">{flag.rule}</span>
                    {' '}— {flag.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
          {decision ? (
            <p className="text-xs text-gray-400">
              Reviewed · {decision} by Dashboard
            </p>
          ) : (
            <>
              <button
                onClick={() => handleAction('Approved')}
                disabled={!!loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading === 'Approved' ? 'Saving…' : '✓ Approve'}
              </button>
              <button
                onClick={() => handleAction('Blocked')}
                disabled={!!loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
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

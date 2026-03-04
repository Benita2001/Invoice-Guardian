'use client'

import { useCallback, useEffect, useState } from 'react'
import InvoiceCard, { Invoice } from './InvoiceCard'

interface VendorRow {
  vendor_name: string
  invoice_count: number
  total_paid: number
  avg_trust_score: number
  worst_tier: string
}

interface AuditData {
  stats: {
    total_scanned: number
    suspicious_count: number
    suspicious_amount: number
    vendor_count: number
  }
  vendors: VendorRow[]
  invoices: Invoice[]
}

const TIER_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  HIGH:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
  MEDIUM:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  LOW:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const SCORE_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-400',
  HIGH:     'text-orange-400',
  MEDIUM:   'text-yellow-400',
  LOW:      'text-emerald-400',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function AuditTab() {
  const [data, setData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  const fetchResults = useCallback(async () => {
    const res = await fetch('/api/audit/results')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchResults() }, [fetchResults])

  // Poll while audit is running
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setPollCount(c => c + 1)
      fetchResults()
    }, 8000)
    return () => clearInterval(id)
  }, [running, fetchResults])

  const handleRunAudit = async () => {
    setRunning(true)
    setRunError(null)
    const res = await fetch('/api/audit/run', { method: 'POST' })
    if (!res.ok) {
      const body = await res.json()
      setRunError(body.error ?? 'Failed to start audit')
      setRunning(false)
      return
    }
    // Auto-stop spinner after 3 min max
    setTimeout(() => setRunning(false), 180_000)
  }

  const stats = data?.stats
  const vendors = data?.vendors ?? []
  const invoices = data?.invoices ?? []

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-white">Historical Audit</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Scans the last 12 months of Gmail for suspicious invoices you may have already paid.
          </p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold transition-all duration-200 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {running ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Scanning…
            </>
          ) : (
            '⚡ Run 12-Month Audit'
          )}
        </button>
      </div>

      {runError && (
        <div className="glass border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          {runError}
        </div>
      )}

      {running && (
        <div className="glass border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 text-sm text-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
          Audit in progress — scanning Gmail, running OCR and scoring. Results update every 8 seconds.
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-zinc-600 text-sm">Loading audit data…</div>
      ) : !stats || stats.total_scanned === 0 ? (
        /* Empty state */
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-20">🔍</div>
          <p className="text-zinc-400 font-medium mb-2">No historical audit data yet</p>
          <p className="text-zinc-600 text-sm">
            Click &quot;Run 12-Month Audit&quot; to scan your Gmail inbox for past invoices.
          </p>
        </div>
      ) : (
        <>
          {/* Stats banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass rounded-xl p-4 border border-white/[0.07]">
              <div className="text-2xl font-bold text-white">{stats.total_scanned}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest mt-0.5">Scanned</div>
            </div>
            <div className="glass rounded-xl p-4 border border-red-500/25">
              <div className="text-2xl font-bold text-red-400">{stats.suspicious_count}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest mt-0.5">Suspicious</div>
            </div>
            <div className="glass rounded-xl p-4 border border-orange-500/25">
              <div className="text-2xl font-bold text-orange-400">{stats.vendor_count}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest mt-0.5">Risky Vendors</div>
            </div>
            <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/5">
              <div className="text-xl font-bold text-red-400 leading-tight">
                {fmt(stats.suspicious_amount)}
              </div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest mt-0.5">
                Paid to suspicious
              </div>
            </div>
          </div>

          {/* Vendor breakdown */}
          {vendors.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-red-500 to-orange-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Vendor Breakdown — sorted by amount paid
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Vendor', 'Invoices', 'Total Paid', 'Avg Trust', 'Worst Tier'].map(h => (
                        <th key={h} className="text-left text-xs font-bold text-zinc-600 uppercase tracking-wider px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v, i) => (
                      <tr key={v.vendor_name} className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors ${i === 0 ? 'bg-red-500/5' : ''}`}>
                        <td className="px-5 py-3 font-medium text-white">{v.vendor_name}</td>
                        <td className="px-5 py-3 text-zinc-400">{v.invoice_count}</td>
                        <td className="px-5 py-3 font-bold text-red-400">{fmt(v.total_paid)}</td>
                        <td className={`px-5 py-3 font-bold ${SCORE_COLOR[v.worst_tier] ?? 'text-zinc-400'}`}>
                          {v.avg_trust_score}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${TIER_BADGE[v.worst_tier] ?? ''}`}>
                            {v.worst_tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Individual invoices */}
          {invoices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-orange-500 to-red-500" />
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                  {invoices.length} Flagged Historical Invoice{invoices.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {invoices.map(inv => (
                  <InvoiceCard
                    key={inv.id}
                    invoice={inv}
                    onDecision={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

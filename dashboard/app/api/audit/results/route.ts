import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TIER_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

export async function GET() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('is_historical', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const invoices = data ?? []
  const suspicious = invoices.filter(i => ['HIGH', 'CRITICAL'].includes(i.risk_tier))
  const suspiciousAmount = suspicious.reduce((sum, i) => sum + (i.total ?? 0), 0)

  // Group suspicious invoices by vendor
  const vendorMap = new Map<string, {
    invoice_count: number
    total_paid: number
    scores: number[]
    tiers: string[]
  }>()

  for (const inv of suspicious) {
    const name: string = inv.vendor_name ?? 'Unknown'
    if (!vendorMap.has(name)) {
      vendorMap.set(name, { invoice_count: 0, total_paid: 0, scores: [], tiers: [] })
    }
    const v = vendorMap.get(name)!
    v.invoice_count++
    v.total_paid += inv.total ?? 0
    v.scores.push(inv.risk_score ?? 100)
    v.tiers.push(inv.risk_tier)
  }

  const vendors = Array.from(vendorMap.entries())
    .map(([name, v]) => ({
      vendor_name: name,
      invoice_count: v.invoice_count,
      total_paid: Math.round(v.total_paid * 100) / 100,
      avg_trust_score: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
      worst_tier: [...v.tiers].sort(
        (a, b) => (TIER_ORDER[a] ?? 99) - (TIER_ORDER[b] ?? 99),
      )[0],
    }))
    .sort((a, b) => b.total_paid - a.total_paid)

  return NextResponse.json({
    stats: {
      total_scanned: invoices.length,
      suspicious_count: suspicious.length,
      suspicious_amount: Math.round(suspiciousAmount * 100) / 100,
      vendor_count: vendors.length,
    },
    vendors,
    invoices: suspicious,
  })
}

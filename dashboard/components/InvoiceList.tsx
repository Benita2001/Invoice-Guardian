'use client'

import { useState } from 'react'
import InvoiceCard, { Invoice } from './InvoiceCard'

export default function InvoiceList({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = useState(initialInvoices)

  const handleDecision = (id: string, decision: string) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === id
          ? { ...inv, decision, reviewed_by: 'Dashboard', reviewed_at: new Date().toISOString() }
          : inv,
      ),
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-24 glass rounded-2xl">
        <div className="text-5xl mb-4 opacity-20">✓</div>
        <p className="text-zinc-500 font-medium">No invoices found</p>
        <p className="text-zinc-700 text-sm mt-1">Invoices will appear here as they are processed</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invoices.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} onDecision={handleDecision} />
      ))}
    </div>
  )
}

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
      <div className="text-center py-24 text-gray-400">
        <div className="text-5xl mb-4">✓</div>
        <p className="text-lg font-medium text-gray-500">No invoices found</p>
        <p className="text-sm mt-1">Invoices will appear here as they are processed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} onDecision={handleDecision} />
      ))}
    </div>
  )
}

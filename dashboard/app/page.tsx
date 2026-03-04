import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🛡️</span>
          <span className="font-bold text-gray-900 text-lg">Invoice Guardian</span>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          Dashboard →
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-8 py-28 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Pipeline Active
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
          Stop fraudulent invoices<br />
          <span className="text-indigo-600">before they&apos;re paid</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Invoice Guardian watches your Gmail, extracts data from PDF invoices using OCR,
          scores each one for fraud signals, and alerts your team on Slack — all automatically.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-indigo-200"
        >
          Open Dashboard
          <span className="text-lg">→</span>
        </Link>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Four steps, fully automated</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust score explainer */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trust Scoring</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-5">Scores, not guesswork</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Every invoice receives a trust score from 0–100. A clean invoice scores 100.
              Each fraud signal deducts points with a clear explanation — no black boxes.
            </p>
            <ul className="space-y-3">
              {TIERS.map(t => (
                <li key={t.name} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dot}`} />
                  <span className="text-sm text-gray-700">
                    <span className="font-bold">{t.name}</span>
                    <span className="text-gray-400 mx-1.5">·</span>
                    {t.range}
                    <span className="text-gray-400 mx-1.5">·</span>
                    {t.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample card preview */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Example flagged invoice</p>
            <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-red-500 p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">Unknown Vendor</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">CRITICAL</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">#N/A · $50,000.00 · Jan 15, 2026</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 leading-none">15</div>
                  <div className="text-xs text-gray-400">/ 100 trust</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {SAMPLE_FLAGS.map(f => (
                  <div key={f.rule} className="flex items-start gap-2 text-xs">
                    <span className="bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded font-mono shrink-0">-{f.pts}</span>
                    <span className="text-gray-600"><strong className="text-gray-800">{f.rule}</strong> — {f.detail}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg">✓ Approve</button>
                <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg">✗ Block</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-indigo-600 px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Your pipeline is live and watching</h2>
        <p className="text-indigo-200 text-sm mb-8 max-w-md mx-auto">
          Invoice Guardian is actively polling Gmail. Head to the dashboard to review flagged invoices.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg"
        >
          Open Dashboard →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        🛡️ Invoice Guardian — AI-powered invoice fraud detection
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    icon: '📬',
    title: 'Gmail Polling',
    description: 'Scans your inbox every 60 seconds for PDF invoice attachments matching your query.',
  },
  {
    icon: '🔍',
    title: 'OCR Extraction',
    description: 'Veryfi pulls vendor names, invoice numbers, totals, and line items from each PDF.',
  },
  {
    icon: '🧠',
    title: 'Trust Scoring',
    description: 'Ten fraud-detection rules score each invoice from 0–100. Flags explain every deduction.',
  },
  {
    icon: '💬',
    title: 'Slack Alerts',
    description: 'Your team gets instant Slack messages with one-click Approve or Block buttons.',
  },
]

const TIERS = [
  { name: 'LOW',      dot: 'bg-green-500',  range: '70–100', desc: 'Proceed with payment' },
  { name: 'MEDIUM',   dot: 'bg-yellow-400', range: '40–69',  desc: 'Worth a second look' },
  { name: 'HIGH',     dot: 'bg-orange-500', range: '20–39',  desc: 'Multiple red flags' },
  { name: 'CRITICAL', dot: 'bg-red-500',    range: '0–19',   desc: 'Do not pay' },
]

const SAMPLE_FLAGS = [
  { rule: 'missing_vendor',         pts: 25, detail: 'Vendor name is missing or unrecognised' },
  { rule: 'high_amount',            pts: 20, detail: 'Unusually high total: $50,000.00' },
  { rule: 'missing_invoice_number', pts: 15, detail: 'No invoice number found on document' },
  { rule: 'missing_line_items',     pts: 15, detail: 'Invoice has no line items' },
]

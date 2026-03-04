import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const res = await fetch('http://127.0.0.1:8000/audit/run', {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`Backend responded ${res.status}`)
    return NextResponse.json({ status: 'started' })
  } catch {
    return NextResponse.json(
      { error: 'Could not reach audit service. Is the backend running on port 8000?' },
      { status: 503 },
    )
  }
}

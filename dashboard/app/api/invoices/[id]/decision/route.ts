import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const { decision } = await request.json()

  if (!['Approved', 'Blocked'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({
      decision,
      reviewed_by: 'Dashboard',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

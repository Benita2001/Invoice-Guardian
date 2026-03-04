-- Invoice Guardian — Supabase table schema
-- Run this in the Supabase SQL Editor to create the invoices table.

create table if not exists invoices (
    id           uuid primary key default gen_random_uuid(),
    created_at   timestamptz not null default now(),

    -- OCR fields
    vendor_name    text,
    vendor_address text,
    invoice_number text,
    invoice_date   text,
    due_date       text,
    subtotal       numeric,
    tax            numeric,
    total          numeric,
    currency_code  text default 'USD',
    line_items     jsonb default '[]'::jsonb,
    raw_ocr        jsonb,

    -- Risk scoring
    risk_score     integer not null default 0,
    risk_tier      text not null default 'LOW',
    risk_flags     jsonb default '[]'::jsonb,

    -- Reviewer decision
    decision       text,            -- 'Approved' | 'Blocked' | null
    reviewed_by    text,
    reviewed_at    timestamptz
);

-- Index for the dashboard query (flagged invoices, newest first)
create index if not exists idx_invoices_flagged
    on invoices (risk_score, created_at desc)
    where risk_score > 0;

-- Index for looking up by invoice number
create index if not exists idx_invoices_invoice_number
    on invoices (invoice_number)
    where invoice_number is not null;

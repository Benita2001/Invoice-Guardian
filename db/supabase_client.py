"""Supabase client — persists invoices and reviewer feedback."""

import logging
from datetime import datetime, timezone

from supabase import create_client, Client

import config

log = logging.getLogger(__name__)

_client: Client | None = None


def get_client() -> Client:
    """Return a cached, authenticated Supabase client instance."""
    global _client
    if _client is None:
        _client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)
    return _client


def insert_invoice(invoice_record: dict) -> dict:
    """Insert a new invoice record (OCR data + risk score).

    Expects the merged output of extract_invoice() | score_invoice():
        vendor_name, invoice_number, date, due_date, subtotal, tax,
        total, currency_code, line_items, raw_response,
        score, risk_tier, flags.

    Returns the inserted row (including the generated id).
    """
    row = {
        "vendor_name": invoice_record.get("vendor_name"),
        "vendor_address": invoice_record.get("vendor_address"),
        "invoice_number": invoice_record.get("invoice_number"),
        "invoice_date": invoice_record.get("date"),
        "due_date": invoice_record.get("due_date"),
        "subtotal": invoice_record.get("subtotal"),
        "tax": invoice_record.get("tax"),
        "total": invoice_record.get("total"),
        "currency_code": invoice_record.get("currency_code"),
        "line_items": invoice_record.get("line_items", []),
        "risk_score": invoice_record.get("score"),
        "risk_tier": invoice_record.get("risk_tier"),
        "risk_flags": invoice_record.get("flags", []),
        "raw_ocr": invoice_record.get("raw_response"),
        "is_historical": invoice_record.get("is_historical", False),
        "already_paid": invoice_record.get("already_paid", False),
        "gmail_message_id": invoice_record.get("gmail_message_id"),
    }

    result = get_client().table("invoices").insert(row).execute()
    inserted = result.data[0]
    log.info("Inserted invoice row id=%s", inserted["id"])
    return inserted


def update_decision(invoice_id: str, decision: str, reviewer: str) -> dict:
    """Record a reviewer's Approve/Block decision against an invoice.

    Sets the decision, reviewer username, and timestamp.
    Returns the updated row.
    """
    row = {
        "decision": decision,
        "reviewed_by": reviewer,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
    }

    result = (
        get_client()
        .table("invoices")
        .update(row)
        .eq("id", invoice_id)
        .execute()
    )
    updated = result.data[0]
    log.info("Invoice %s marked as %s by %s", invoice_id, decision, reviewer)
    return updated


def historical_message_exists(gmail_message_id: str) -> bool:
    """Return True if a historical invoice record already exists for this Gmail message."""
    result = (
        get_client()
        .table("invoices")
        .select("id")
        .eq("gmail_message_id", gmail_message_id)
        .eq("is_historical", True)
        .limit(1)
        .execute()
    )
    return len(result.data) > 0


def get_flagged_invoices(limit: int = 50, min_score: int = 1) -> list[dict]:
    """Fetch recent invoices that have at least one risk flag.

    Results are ordered by creation time (newest first) and can be
    filtered by minimum risk score.  Useful for a dashboard view.

    Returns a list of invoice rows.
    """
    result = (
        get_client()
        .table("invoices")
        .select("*")
        .gte("risk_score", min_score)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data

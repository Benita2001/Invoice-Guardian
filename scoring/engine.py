"""Risk scoring engine — evaluates invoice data for fraud signals."""

import logging
import re
from datetime import datetime, timedelta

import config

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Rule registry — each rule is a function that receives the normalised
# invoice dict and returns a list of Flag dicts (empty list = no hit).
# ---------------------------------------------------------------------------

_rules: list[callable] = []


def rule(fn):
    """Decorator to register a scoring rule."""
    _rules.append(fn)
    return fn


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------

@rule
def missing_vendor(inv: dict) -> list[dict]:
    name = (inv.get("vendor_name") or "").strip()
    if not name or name == "Unknown":
        return [{"rule": "missing_vendor", "detail": "Vendor name is missing or unrecognised", "points": 25}]
    return []


@rule
def missing_invoice_number(inv: dict) -> list[dict]:
    if not inv.get("invoice_number"):
        return [{"rule": "missing_invoice_number", "detail": "No invoice number found on document", "points": 15}]
    return []


@rule
def round_total(inv: dict) -> list[dict]:
    total = inv.get("total")
    if total is not None and total > 0 and total == int(total):
        return [{"rule": "round_total", "detail": f"Total is a round number (${total:.2f})", "points": 10}]
    return []


@rule
def high_amount(inv: dict) -> list[dict]:
    total = inv.get("total")
    if total is not None and total >= 50_000:
        return [{"rule": "high_amount", "detail": f"Unusually high total: ${total:,.2f}", "points": 20}]
    if total is not None and total >= 10_000:
        return [{"rule": "high_amount", "detail": f"High total: ${total:,.2f}", "points": 10}]
    return []


@rule
def missing_line_items(inv: dict) -> list[dict]:
    items = inv.get("line_items", [])
    if not items:
        return [{"rule": "missing_line_items", "detail": "Invoice has no line items", "points": 15}]
    return []


@rule
def line_item_math(inv: dict) -> list[dict]:
    """Check whether line-item totals add up to the subtotal / total."""
    items = inv.get("line_items", [])
    subtotal = inv.get("subtotal")
    total = inv.get("total")
    if not items or (subtotal is None and total is None):
        return []

    items_sum = sum(i.get("total") or 0 for i in items)
    reference = subtotal if subtotal is not None else total
    if reference and abs(items_sum - reference) > 0.02 * reference:
        return [{
            "rule": "line_item_math",
            "detail": f"Line items sum (${items_sum:,.2f}) differs from stated amount (${reference:,.2f})",
            "points": 20,
        }]
    return []


@rule
def past_due_date(inv: dict) -> list[dict]:
    due = inv.get("due_date")
    if not due:
        return []
    try:
        due_dt = _parse_date(due)
    except ValueError:
        return []
    if due_dt and due_dt < datetime.now() - timedelta(days=30):
        return [{"rule": "past_due_date", "detail": f"Due date ({due}) is more than 30 days in the past", "points": 15}]
    return []


@rule
def missing_date(inv: dict) -> list[dict]:
    if not inv.get("date"):
        return [{"rule": "missing_date", "detail": "Invoice date is missing", "points": 10}]
    return []


@rule
def duplicate_line_descriptions(inv: dict) -> list[dict]:
    items = inv.get("line_items", [])
    descriptions = [i.get("description", "").strip().lower() for i in items if i.get("description")]
    if len(descriptions) != len(set(descriptions)) and len(descriptions) > 1:
        return [{"rule": "duplicate_line_descriptions", "detail": "Multiple line items share the same description", "points": 10}]
    return []


@rule
def suspicious_vendor_name(inv: dict) -> list[dict]:
    name = (inv.get("vendor_name") or "").strip()
    if not name:
        return []
    # Flag vendor names that look like random strings (no vowels, very short, etc.)
    if len(name) <= 2:
        return [{"rule": "suspicious_vendor_name", "detail": f"Vendor name is suspiciously short: '{name}'", "points": 15}]
    if re.fullmatch(r"[^aeiouAEIOU\s]+", name) and len(name) > 3:
        return [{"rule": "suspicious_vendor_name", "detail": f"Vendor name has no vowels: '{name}'", "points": 10}]
    return []


@rule
def zero_total(inv: dict) -> list[dict]:
    total = inv.get("total")
    if total is not None and total == 0:
        return [{"rule": "zero_total", "detail": "Invoice total is $0.00", "points": 20}]
    return []


# ---------------------------------------------------------------------------
# Tier classification
# ---------------------------------------------------------------------------

def _classify(score: int) -> str:
    if score <= config.RISK_TIER_CRITICAL_MAX:
        return "CRITICAL"
    if score <= config.RISK_TIER_HIGH_MAX:
        return "HIGH"
    if score <= config.RISK_TIER_MEDIUM_MAX:
        return "MEDIUM"
    return "LOW"


# ---------------------------------------------------------------------------
# Date parsing helper
# ---------------------------------------------------------------------------

_DATE_FORMATS = ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%B %d, %Y", "%b %d, %Y"]


def _parse_date(value: str) -> datetime | None:
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def score_invoice(invoice_data: dict) -> dict:
    """Run all registered rules against parsed invoice data.

    Returns:
        {
            "score": int (0-100, capped),
            "risk_tier": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "flags": [{"rule": str, "detail": str, "points": int}, ...],
        }
    """
    flags: list[dict] = []
    for rule_fn in _rules:
        flags.extend(rule_fn(invoice_data))

    deductions = sum(f["points"] for f in flags)
    score = max(100 - deductions, 0)
    tier = _classify(score)

    log.info(
        "Trust score: %d / 100 (%s) — %d flag(s)",
        score, tier, len(flags),
    )
    return {"score": score, "risk_tier": tier, "flags": flags}

"""Veryfi OCR client — extracts structured data from invoice PDFs."""

import logging
import tempfile
from pathlib import Path

from veryfi import Client

import config

log = logging.getLogger(__name__)

_client = None


def _get_client() -> Client:
    """Return a cached Veryfi client instance."""
    global _client
    if _client is None:
        _client = Client(
            config.VERYFI_CLIENT_ID,
            config.VERYFI_CLIENT_SECRET,
            config.VERYFI_USERNAME,
            config.VERYFI_API_KEY,
        )
    return _client


def extract_invoice(pdf_bytes: bytes, file_name: str = "invoice.pdf") -> dict:
    """Send a PDF to Veryfi and return normalised invoice fields.

    The SDK requires a file path, so we write bytes to a temp file,
    call process_document, then clean up.

    Returns:
        {
            "vendor_name": str,
            "vendor_address": str | None,
            "invoice_number": str | None,
            "date": str | None,
            "due_date": str | None,
            "subtotal": float | None,
            "tax": float | None,
            "total": float | None,
            "currency_code": str | None,
            "line_items": [{"description": str, "quantity": float,
                            "price": float, "total": float}, ...],
            "raw_response": dict,
        }
    """
    client = _get_client()

    suffix = Path(file_name).suffix or ".pdf"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        log.info("Sending %s (%d bytes) to Veryfi", file_name, len(pdf_bytes))
        raw = client.process_document(tmp_path)
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    log.info(
        "Veryfi returned invoice_number=%s vendor=%s total=%s",
        raw.get("invoice_number"),
        _safe_vendor(raw),
        raw.get("total"),
    )

    return _normalise(raw)


def _safe_vendor(raw: dict) -> str | None:
    """Extract vendor_name whether it's a string or a DetailedField dict."""
    v = raw.get("vendor", {}).get("name") or raw.get("vendor_name")
    if isinstance(v, dict):
        return v.get("value")
    return v


def _normalise(raw: dict) -> dict:
    """Flatten Veryfi's response into a consistent schema."""
    vendor_name = _safe_vendor(raw) or "Unknown"

    line_items = []
    for item in raw.get("line_items", []):
        line_items.append({
            "description": item.get("description", ""),
            "quantity": item.get("quantity", 1),
            "price": item.get("price", 0),
            "total": item.get("total", 0),
        })

    return {
        "vendor_name": vendor_name,
        "vendor_address": raw.get("vendor", {}).get("address") or raw.get("vendor_address"),
        "invoice_number": raw.get("invoice_number"),
        "date": raw.get("date"),
        "due_date": raw.get("due_date"),
        "subtotal": raw.get("subtotal"),
        "tax": raw.get("tax"),
        "total": raw.get("total"),
        "currency_code": raw.get("currency_code"),
        "line_items": line_items,
        "raw_response": raw,
    }

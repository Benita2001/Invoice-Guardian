"""Gmail poller — watches an inbox for invoice PDF attachments."""

import base64
import logging
from datetime import datetime, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

import config

log = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

_service = None


def authenticate():
    """Build Gmail API service using OAuth2 credentials.

    On first run, opens a browser for consent. Subsequent runs reuse
    the saved token.json. Stores the service in module-level _service.
    """
    global _service
    creds = None
    token_path = Path(config.GMAIL_TOKEN_JSON)
    creds_path = Path(config.GMAIL_CREDENTIALS_JSON)

    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json())

    _service = build("gmail", "v1", credentials=creds)
    log.info("Gmail API authenticated")


def _get_service():
    """Return the cached Gmail service, raising if not yet authenticated."""
    if _service is None:
        raise RuntimeError("Gmail service not initialized — call authenticate() first")
    return _service


def poll_inbox() -> list[dict]:
    """Fetch unread messages matching the invoice query and download PDF attachments.

    Marks fetched messages as read so they aren't reprocessed on the next cycle.

    Returns:
        [{"message_id": str, "pdf_bytes": bytes, "subject": str}, ...]
    """
    service = _get_service()
    query = f"is:unread {config.GMAIL_QUERY}"
    results = service.users().messages().list(
        userId="me", q=query, labelIds=[config.GMAIL_LABEL],
    ).execute()

    message_ids = [m["id"] for m in results.get("messages", [])]
    if not message_ids:
        log.debug("No new invoice emails found")
        return []

    log.info("Found %d new invoice email(s)", len(message_ids))
    invoices = []

    for msg_id in message_ids:
        msg = service.users().messages().get(
            userId="me", id=msg_id, format="full",
        ).execute()

        subject = _extract_header(msg, "Subject") or "(no subject)"
        pdfs = _download_pdf_attachments(service, msg)

        if not pdfs:
            log.warning("Message %s has no PDF attachments, skipping", msg_id)
            continue

        for pdf_bytes in pdfs:
            invoices.append({
                "message_id": msg_id,
                "pdf_bytes": pdf_bytes,
                "subject": subject,
            })

        # Mark as read so we don't reprocess
        service.users().messages().modify(
            userId="me", id=msg_id,
            body={"removeLabelIds": ["UNREAD"]},
        ).execute()

    return invoices


def _extract_header(message: dict, name: str) -> str | None:
    """Pull a header value (e.g. Subject) from a Gmail message resource."""
    headers = message.get("payload", {}).get("headers", [])
    for h in headers:
        if h["name"].lower() == name.lower():
            return h["value"]
    return None


def scan_historical_invoices(months: int = 12) -> dict:
    """Fetch all invoice emails from the past N months, run the full pipeline,
    and persist each to Supabase with is_historical=True, already_paid=True.

    Unlike poll_inbox(), this does NOT filter for unread messages — it scans
    everything. Already-processed messages (identified by gmail_message_id) are
    skipped so re-running the audit is idempotent.

    Returns:
        {"scanned": int, "saved": int, "skipped": int, "errors": int}
    """
    from ocr.veryfi_client import extract_invoice
    from scoring.engine import score_invoice
    from db.supabase_client import insert_invoice, historical_message_exists

    if _service is None:
        authenticate()

    service = _get_service()

    after = (datetime.now() - timedelta(days=months * 30)).strftime("%Y/%m/%d")
    query = f"{config.GMAIL_QUERY} after:{after}"
    log.info("Historical audit: query='%s'", query)

    # Paginate through all matching messages
    all_messages: list[dict] = []
    page_token = None
    while True:
        kwargs: dict = {"userId": "me", "q": query, "maxResults": 100}
        if page_token:
            kwargs["pageToken"] = page_token
        resp = service.users().messages().list(**kwargs).execute()
        all_messages.extend(resp.get("messages", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break

    log.info("Historical audit: %d messages to process", len(all_messages))
    scanned = saved = skipped = errors = 0

    for msg in all_messages:
        msg_id = msg["id"]

        if historical_message_exists(msg_id):
            skipped += 1
            continue

        try:
            full_msg = service.users().messages().get(
                userId="me", id=msg_id, format="full",
            ).execute()
            pdfs = _download_pdf_attachments(service, full_msg)

            for pdf_bytes in pdfs:
                scanned += 1
                try:
                    invoice_data = extract_invoice(pdf_bytes, f"historical_{msg_id}.pdf")
                    risk_result = score_invoice(invoice_data)
                    insert_invoice({
                        **invoice_data,
                        **risk_result,
                        "is_historical": True,
                        "already_paid": True,
                        "gmail_message_id": msg_id,
                    })
                    saved += 1
                except Exception:
                    log.exception("Error processing PDF from message %s", msg_id)
                    errors += 1
        except Exception:
            log.exception("Error fetching message %s", msg_id)
            errors += 1

    stats = {"scanned": scanned, "saved": saved, "skipped": skipped, "errors": errors}
    log.info("Historical audit complete: %s", stats)
    return stats


def _download_pdf_attachments(service, message: dict) -> list[bytes]:
    """Walk MIME parts and download all PDF attachments from a message."""
    pdfs = []
    parts = message.get("payload", {}).get("parts", [])
    for part in parts:
        filename = part.get("filename", "")
        mime = part.get("mimeType", "")
        if mime == "application/pdf" or filename.lower().endswith(".pdf"):
            att_id = part.get("body", {}).get("attachmentId")
            if not att_id:
                continue
            att = service.users().messages().attachments().get(
                userId="me", messageId=message["id"], id=att_id,
            ).execute()
            data = base64.urlsafe_b64decode(att["data"])
            pdfs.append(data)
            log.debug("Downloaded attachment: %s (%d bytes)", filename, len(data))
    return pdfs

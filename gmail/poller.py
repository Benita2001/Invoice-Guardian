"""Gmail poller — watches an inbox for invoice PDF attachments."""

import base64
import logging
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

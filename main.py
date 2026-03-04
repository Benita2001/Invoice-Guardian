"""Invoice Guardian — entry point.

Runs two concurrent loops:
  1. Gmail poller  → OCR → scoring → Slack alert → DB insert  (polling loop)
  2. Slack Bolt app listening for Approve/Block button clicks   (HTTP server)
"""

import threading
import time
import logging

import config
from gmail.poller import authenticate, poll_inbox
from ocr.veryfi_client import extract_invoice
from scoring.engine import score_invoice
from slack.notifier import send_alert
from db.supabase_client import insert_invoice

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("invoice-guardian")


def process_invoice(message: dict) -> None:
    """Pipeline: OCR → score → persist → alert."""
    invoice_data = extract_invoice(message["pdf_bytes"])
    risk_result = score_invoice(invoice_data)
    record = insert_invoice({**invoice_data, **risk_result})
    invoice_id = record["id"]
    send_alert(invoice_data, risk_result, invoice_id)
    log.info("Processed invoice %s — risk: %s", invoice_id, risk_result["risk_tier"])


def polling_loop() -> None:
    """Poll Gmail on an interval and process new invoices."""
    authenticate()
    while True:
        try:
            messages = poll_inbox()
            for msg in messages:
                process_invoice(msg)
        except Exception:
            log.exception("Error during polling cycle")
        time.sleep(config.GMAIL_POLL_INTERVAL)


def start_slack_server() -> None:
    """Start the Slack Bolt app to handle interactive button clicks."""
    from slack.handler import handle_action  # noqa: F401
    from slack_bolt import App

    app = App(
        token=config.SLACK_BOT_TOKEN,
        signing_secret=config.SLACK_SIGNING_SECRET,
    )
    app.action("approve_invoice")(handle_action)
    app.action("block_invoice")(handle_action)
    app.start(port=3000)


if __name__ == "__main__":
    log.info("Starting Invoice Guardian")
    poller_thread = threading.Thread(target=polling_loop, daemon=True)
    poller_thread.start()
    start_slack_server()

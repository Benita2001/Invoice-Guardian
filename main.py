"""Invoice Guardian — entry point.

Runs three concurrent loops:
  1. Gmail poller  → OCR → scoring → Slack alert → DB insert  (polling loop)
  2. Slack Bolt app listening for Approve/Block button clicks   (HTTP server)
  3. Audit API     → lightweight HTTP server on :8000 for historical scans
"""

import json
import threading
import time
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer

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


def start_audit_api() -> None:
    """Minimal HTTP server on :8000 that triggers historical audits.

    POST /audit/run   — starts scan_historical_invoices() in a background thread.
    GET  /audit/health — returns {"status": "ok"}.
    """
    from gmail.poller import scan_historical_invoices

    class _Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path == "/audit/run":
                def _run():
                    try:
                        scan_historical_invoices()
                    except Exception:
                        log.exception("Historical audit failed")

                threading.Thread(target=_run, daemon=True).start()
                self._respond(202, {"status": "started"})
            else:
                self._respond(404, {"error": "not found"})

        def do_GET(self):
            if self.path == "/audit/health":
                self._respond(200, {"status": "ok"})
            else:
                self._respond(404, {"error": "not found"})

        def _respond(self, code: int, data: dict) -> None:
            body = json.dumps(data).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, fmt, *args):  # suppress default access log
            log.debug("Audit API: " + fmt, *args)

    server = HTTPServer(("127.0.0.1", 8000), _Handler)
    log.info("Audit API listening on http://127.0.0.1:8000")
    server.serve_forever()


if __name__ == "__main__":
    log.info("Starting Invoice Guardian")
    poller_thread = threading.Thread(target=polling_loop, daemon=True)
    poller_thread.start()
    audit_thread = threading.Thread(target=start_audit_api, daemon=True)
    audit_thread.start()
    start_slack_server()

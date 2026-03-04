"""Slack notifier — posts invoice alerts with Approve / Block buttons."""

import logging

from slack_sdk import WebClient

import config

log = logging.getLogger(__name__)

_client = None

_TIER_EMOJI = {
    "LOW": ":white_check_mark:",
    "MEDIUM": ":warning:",
    "HIGH": ":red_circle:",
    "CRITICAL": ":rotating_light:",
}


def _get_client() -> WebClient:
    global _client
    if _client is None:
        _client = WebClient(token=config.SLACK_BOT_TOKEN)
    return _client


def send_alert(invoice_data: dict, risk_result: dict, invoice_id: str) -> None:
    """Post a Block Kit message to the configured Slack channel.

    Shows vendor name, invoice number, total, risk tier, score,
    and the list of flags that contributed to the score. Includes
    interactive Approve / Block buttons tagged with the invoice_id.
    """
    client = _get_client()
    blocks = _build_blocks(invoice_data, risk_result, invoice_id)
    tier = risk_result["risk_tier"]
    vendor = invoice_data.get("vendor_name", "Unknown")
    fallback = f"Invoice alert: {vendor} — {tier} risk (trust score {risk_result['score']}/100)"

    response = client.chat_postMessage(
        channel=config.SLACK_CHANNEL_ID,
        text=fallback,
        blocks=blocks,
    )
    log.info("Slack alert sent: ts=%s channel=%s", response["ts"], response["channel"])


def _build_blocks(invoice_data: dict, risk_result: dict, invoice_id: str) -> list[dict]:
    """Assemble Block Kit blocks for the alert message."""
    tier = risk_result["risk_tier"]
    score = risk_result["score"]
    flags = risk_result.get("flags", [])
    emoji = _TIER_EMOJI.get(tier, ":question:")

    vendor = invoice_data.get("vendor_name", "Unknown")
    inv_num = invoice_data.get("invoice_number") or "N/A"
    total = invoice_data.get("total")
    currency = invoice_data.get("currency_code") or "USD"
    total_str = f"{currency} {total:,.2f}" if total is not None else "N/A"

    # --- header ---
    blocks: list[dict] = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"{emoji}  Invoice Alert — {tier} Risk"},
        },
        {"type": "divider"},
    ]

    # --- invoice details ---
    blocks.append({
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text": f"*Vendor*\n{vendor}"},
            {"type": "mrkdwn", "text": f"*Invoice #*\n{inv_num}"},
            {"type": "mrkdwn", "text": f"*Total*\n{total_str}"},
            {"type": "mrkdwn", "text": f"*Trust Score*\n{score} / 100"},
        ],
    })

    # --- flags / reasons ---
    if flags:
        bullet_lines = "\n".join(
            f"• *{f['rule']}* (-{f['points']}pts) — {f['detail']}" for f in flags
        )
        blocks.append({"type": "divider"})
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Flags*\n{bullet_lines}"},
        })

    # --- action buttons ---
    blocks.append({"type": "divider"})
    blocks.append({
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {"type": "plain_text", "text": "Approve"},
                "style": "primary",
                "action_id": "approve_invoice",
                "value": invoice_id,
            },
            {
                "type": "button",
                "text": {"type": "plain_text", "text": "Block"},
                "style": "danger",
                "action_id": "block_invoice",
                "value": invoice_id,
            },
        ],
    })

    return blocks

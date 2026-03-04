"""Slack interaction handler — processes Approve / Block button clicks."""

import logging

from db.supabase_client import update_decision

log = logging.getLogger(__name__)

_ACTION_LABELS = {
    "approve_invoice": "Approved",
    "block_invoice": "Blocked",
}


def handle_action(ack, body, say) -> None:
    """Handle an Approve / Block button press from Slack.

    1. Acknowledge the interaction immediately.
    2. Extract the invoice_id from the button value.
    3. Write the decision + reviewer to Supabase.
    4. Post a confirmation reply in the channel.
    """
    ack()

    action = body["actions"][0]
    action_id = action["action_id"]
    invoice_id = action["value"]
    reviewer = body["user"]["username"]
    decision = _ACTION_LABELS.get(action_id, action_id)

    log.info("Reviewer %s chose %s for invoice %s", reviewer, decision, invoice_id)
    update_decision(invoice_id, decision, reviewer)

    say(f":memo: *{reviewer}* marked invoice `{invoice_id}` as *{decision}*.")

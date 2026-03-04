# Invoice Guardian — Progress

## What it does

Polls a Gmail inbox for invoice PDFs, extracts structured data via Veryfi OCR, runs a heuristic risk scoring engine, sends Slack alerts with Approve/Block buttons, and logs all decisions to Supabase.

## Architecture

```
Gmail Inbox
  │  (poll every N seconds)
  ▼
gmail/poller.py  ──▶  ocr/veryfi_client.py  ──▶  scoring/engine.py
                                                        │
                                                        ▼
                                               db/supabase_client.py
                                                        │
                                                        ▼
                                               slack/notifier.py
                                                   [Approve] [Block]
                                                        │
                                                        ▼
                                               slack/handler.py  ──▶  db/supabase_client.py
```

`main.py` orchestrates two threads:
1. **Polling loop** (daemon) — Gmail → OCR → scoring → DB insert → Slack alert
2. **Slack Bolt server** (port 3000) — listens for Approve/Block button clicks → writes decisions to Supabase

## Files created

| File | Purpose |
|---|---|
| `main.py` | Entry point — wires the pipeline and starts both threads |
| `config.py` | Loads all env vars into typed constants |
| `.env.example` | Template for required environment variables |
| `.gitignore` | Excludes secrets, caches, venv |
| `requirements.txt` | Pinned Python dependencies |
| `gmail/__init__.py` | Package init |
| `gmail/poller.py` | OAuth2 auth, inbox polling, PDF attachment download |
| `ocr/__init__.py` | Package init |
| `ocr/veryfi_client.py` | Sends PDFs to Veryfi, normalises response |
| `scoring/__init__.py` | Package init |
| `scoring/engine.py` | 11-rule risk scoring engine with tier classification |
| `slack/__init__.py` | Package init |
| `slack/notifier.py` | Block Kit alert with invoice details + Approve/Block buttons |
| `slack/handler.py` | Processes button clicks, writes decision to Supabase |
| `db/__init__.py` | Package init |
| `db/supabase_client.py` | Insert invoices, update decisions, query flagged invoices |
| `db/schema.sql` | SQL migration for the `invoices` table + indexes |

## Modules built

### 1. Gmail Poller (`gmail/poller.py`)
- OAuth2 authentication with token caching
- Queries for unread emails matching `has:attachment filename:pdf subject:invoice`
- Downloads all PDF attachments from matching messages
- Marks processed messages as read to prevent reprocessing

### 2. Veryfi OCR (`ocr/veryfi_client.py`)
- Writes PDF bytes to a temp file (SDK requires a file path)
- Calls `process_document()` and cleans up the temp file
- Normalises the response into a flat dict: vendor_name, invoice_number, date, due_date, subtotal, tax, total, currency_code, line_items

### 3. Risk Scoring Engine (`scoring/engine.py`)
- Decorator-based rule registry — add a `@rule` function to register it
- 11 heuristic rules:

| Rule | Points | Trigger |
|---|---|---|
| `missing_vendor` | 25 | Vendor name absent or "Unknown" |
| `zero_total` | 20 | Total is $0.00 |
| `high_amount` | 10/20 | Total >= $10k / >= $50k |
| `line_item_math` | 20 | Line items don't sum to subtotal/total (>2% drift) |
| `missing_invoice_number` | 15 | No invoice number on document |
| `missing_line_items` | 15 | No line items at all |
| `past_due_date` | 15 | Due date > 30 days in the past |
| `suspicious_vendor_name` | 10/15 | Name <= 2 chars or has no vowels |
| `round_total` | 10 | Total is a round number |
| `missing_date` | 10 | Invoice date missing |
| `duplicate_line_descriptions` | 10 | Repeated line item descriptions |

- Four risk tiers: **LOW** (0-30), **MEDIUM** (31-60), **HIGH** (61-80), **CRITICAL** (81-100)

### 4. Slack Alerts (`slack/notifier.py` + `slack/handler.py`)
- Block Kit message with header, invoice details grid, flags list, and action buttons
- Tier-specific emoji (checkmark / warning / red circle / siren)
- Green **Approve** and red **Block** buttons carrying the invoice ID
- Handler acknowledges the click, writes the decision to Supabase, and posts a confirmation

### 5. Supabase Persistence (`db/supabase_client.py` + `db/schema.sql`)
- `insert_invoice()` — saves OCR data + risk score as a new row
- `update_decision()` — records Approved/Blocked + reviewer + UTC timestamp
- `get_flagged_invoices()` — dashboard query for recent flagged invoices
- Table uses UUID primary key, JSONB for line_items/flags/raw OCR, and partial indexes

## Credentials needed

| Service | What to set up | Env vars |
|---|---|---|
| **Google Cloud** | Create a project, enable the Gmail API, create OAuth2 Desktop credentials, download `credentials.json` | `GMAIL_CREDENTIALS_JSON`, `GMAIL_TOKEN_JSON` |
| **Veryfi** | Sign up at veryfi.com, get API keys from the dashboard | `VERYFI_CLIENT_ID`, `VERYFI_CLIENT_SECRET`, `VERYFI_USERNAME`, `VERYFI_API_KEY` |
| **Slack** | Create a Slack app with Bot Token scopes (`chat:write`), enable Interactivity (point to `http://<host>:3000/slack/events`) | `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_CHANNEL_ID` |
| **Supabase** | Create a project, run `db/schema.sql` in the SQL Editor | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |

## How to run

```bash
cp .env.example .env
# Fill in all values in .env

python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create the database table
# Paste db/schema.sql into the Supabase SQL Editor and run it

python main.py
```

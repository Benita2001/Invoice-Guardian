import os
from dotenv import load_dotenv

load_dotenv()

# Gmail
GMAIL_CREDENTIALS_JSON = os.getenv("GMAIL_CREDENTIALS_JSON", "credentials.json")
GMAIL_TOKEN_JSON = os.getenv("GMAIL_TOKEN_JSON", "token.json")
GMAIL_POLL_INTERVAL = int(os.getenv("GMAIL_POLL_INTERVAL_SECONDS", "60"))
GMAIL_LABEL = os.getenv("GMAIL_LABEL", "INBOX")
GMAIL_QUERY = os.getenv("GMAIL_QUERY", "has:attachment filename:pdf subject:invoice")

# Veryfi
VERYFI_CLIENT_ID = os.getenv("VERYFI_CLIENT_ID")
VERYFI_CLIENT_SECRET = os.getenv("VERYFI_CLIENT_SECRET")
VERYFI_USERNAME = os.getenv("VERYFI_USERNAME")
VERYFI_API_KEY = os.getenv("VERYFI_API_KEY")

# Trust score tier boundaries (inclusive upper bounds, higher = more trustworthy)
RISK_TIER_CRITICAL_MAX = int(os.getenv("RISK_TIER_CRITICAL_MAX", "19"))
RISK_TIER_HIGH_MAX = int(os.getenv("RISK_TIER_HIGH_MAX", "39"))
RISK_TIER_MEDIUM_MAX = int(os.getenv("RISK_TIER_MEDIUM_MAX", "69"))

# Slack
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")
SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID")

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

CREATE TABLE IF NOT EXISTS campaign_engagement_receipts (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES paid_attention_messages(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_address TEXT NOT NULL REFERENCES wallet_accounts(address),
  action TEXT NOT NULL CHECK(action IN ('acknowledge','click','reply')),
  signature TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, recipient_address, action)
);

CREATE INDEX IF NOT EXISTS campaign_engagement_receipts_campaign_idx ON campaign_engagement_receipts(campaign_id, action, created_at);

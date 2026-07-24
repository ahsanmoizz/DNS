CREATE TABLE IF NOT EXISTS paid_attention_messages (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  recipient_address TEXT NOT NULL REFERENCES wallet_accounts(address),
  creative JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'delivered' CHECK(status IN ('delivered','read','dismissed')),
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  UNIQUE(campaign_id, recipient_address)
);
CREATE INDEX IF NOT EXISTS paid_attention_recipient_idx ON paid_attention_messages(recipient_address, delivered_at DESC);

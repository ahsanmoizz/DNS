CREATE TABLE IF NOT EXISTS protocol_controls (
  singleton BOOLEAN PRIMARY KEY DEFAULT true CHECK(singleton),
  mail_relay_paused BOOLEAN NOT NULL DEFAULT false,
  updated_by TEXT REFERENCES wallet_accounts(address),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO protocol_controls(singleton) VALUES(true) ON CONFLICT(singleton) DO NOTHING;

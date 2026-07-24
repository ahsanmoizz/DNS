CREATE TABLE IF NOT EXISTS ccip_records (
  request_hash TEXT PRIMARY KEY,
  node TEXT NOT NULL,
  owner_address TEXT NOT NULL REFERENCES wallet_accounts(address),
  extra_data TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ccip_records_node_idx ON ccip_records(node);

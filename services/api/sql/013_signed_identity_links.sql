CREATE TABLE IF NOT EXISTS signed_identity_links (
  primary_address TEXT NOT NULL REFERENCES wallet_accounts(address),
  linked_address TEXT NOT NULL REFERENCES wallet_accounts(address),
  signature TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  PRIMARY KEY(primary_address, linked_address),
  CHECK(primary_address <> linked_address)
);
CREATE INDEX IF NOT EXISTS signed_identity_links_linked_idx ON signed_identity_links(linked_address) WHERE revoked_at IS NULL;

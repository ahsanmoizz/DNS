CREATE TABLE IF NOT EXISTS google_drive_connections (
  address TEXT PRIMARY KEY REFERENCES wallet_accounts(address),
  encrypted_refresh_token TEXT NOT NULL,
  scope TEXT,
  email TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

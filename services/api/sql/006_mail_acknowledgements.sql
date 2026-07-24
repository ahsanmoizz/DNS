ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS acknowledgement_signature TEXT;
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

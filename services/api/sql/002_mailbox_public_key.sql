ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS public_key JSONB;
ALTER TABLE mailboxes DROP CONSTRAINT IF EXISTS mailboxes_storage_adapter_check;
ALTER TABLE mailboxes ADD CONSTRAINT mailboxes_storage_adapter_check CHECK (storage_adapter IN ('none','google-drive','onedrive'));
ALTER TABLE mailboxes ALTER COLUMN storage_adapter SET DEFAULT 'none';

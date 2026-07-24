ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS chain_campaign_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_chain_campaign_id_unique ON campaigns(chain_campaign_id) WHERE chain_campaign_id IS NOT NULL;

-- Funded campaigns created before the protected review gate are moved back
-- into review; no existing campaign is silently delivered.
UPDATE campaigns SET status = 'review' WHERE status = 'funded';

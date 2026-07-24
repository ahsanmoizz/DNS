-- Mailbox actions are recipient-private metadata. They never change the
-- relay's canonical delivery record, which is also used for sender receipts.
CREATE TABLE IF NOT EXISTS mailbox_message_state (
  message_id UUID NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
  recipient_namehash TEXT NOT NULL REFERENCES mailboxes(namehash) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'delivered' CHECK (state IN ('delivered','read','acknowledged','archived','deleted')),
  acknowledgement_signature TEXT,
  read_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, recipient_namehash)
);

CREATE INDEX IF NOT EXISTS mailbox_message_state_folder_idx
  ON mailbox_message_state(recipient_namehash, state, updated_at DESC);

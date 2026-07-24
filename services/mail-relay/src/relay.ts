import { ciphertextHash, validateEnvelope, type Envelope } from "./envelope.js";
export type DeliveryState = "queued" | "delivered" | "failed" | "acknowledged" | "archived" | "deleted";
export type RelayedMessage = { id: string; envelope: Envelope; ciphertextHash: string; receivedAt: number; state: DeliveryState; readAt?: number };
export class MailRelay {
  private readonly messages = new Map<string, RelayedMessage>(); private readonly nonceIndex = new Set<string>(); private readonly blocked = new Map<string, Set<string>>(); private paused = false;
  setPaused(paused: boolean) { this.paused = paused; }
  isPaused() { return this.paused; }
  submit(raw: unknown, now = Math.floor(Date.now() / 1000)): RelayedMessage { if (this.paused) throw new Error("Daily Mail relay is paused."); const envelope = validateEnvelope(raw, now); const replayKey = `${envelope.from.toLowerCase()}:${envelope.nonce}`; if (this.nonceIndex.has(replayKey)) throw new Error("Replay-protected mail nonce already exists."); if (this.blocked.get(envelope.recipientNamehash)?.has(envelope.from.toLowerCase())) throw new Error("Recipient has blocked this sender."); const id = `${envelope.recipientNamehash}:${envelope.nonce}`; const message: RelayedMessage = { id, envelope, ciphertextHash: ciphertextHash(envelope.ciphertext), receivedAt: now, state: "delivered" }; this.nonceIndex.add(replayKey); this.messages.set(id, message); return message; }
  list(recipientNamehash: string) { return [...this.messages.values()].filter(message => message.envelope.recipientNamehash === recipientNamehash && message.state !== "deleted").sort((a, b) => b.receivedAt - a.receivedAt); }
  markRead(id: string, now = Math.floor(Date.now() / 1000)) { const message = this.require(id); message.readAt = now; return message; }
  acknowledge(id: string) { const message = this.require(id); message.state = "acknowledged"; return message; }
  archive(id: string) { const message = this.require(id); message.state = "archived"; return message; }
  delete(id: string) { const message = this.require(id); message.state = "deleted"; return message; }
  block(recipientNamehash: string, sender: string) { const senders = this.blocked.get(recipientNamehash) ?? new Set<string>(); senders.add(sender.toLowerCase()); this.blocked.set(recipientNamehash, senders); }
  private require(id: string) { const message = this.messages.get(id); if (!message) throw new Error("Encrypted mail metadata was not found."); return message; }
}

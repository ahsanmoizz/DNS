import { ciphertextHash, validateEnvelope } from "./envelope.js";
export class MailRelay {
    messages = new Map();
    nonceIndex = new Set();
    blocked = new Map();
    submit(raw, now = Math.floor(Date.now() / 1000)) { const envelope = validateEnvelope(raw, now); const replayKey = `${envelope.from.toLowerCase()}:${envelope.nonce}`; if (this.nonceIndex.has(replayKey))
        throw new Error("Replay-protected mail nonce already exists."); if (this.blocked.get(envelope.recipientNamehash)?.has(envelope.from.toLowerCase()))
        throw new Error("Recipient has blocked this sender."); const id = `${envelope.recipientNamehash}:${envelope.nonce}`; const message = { id, envelope, ciphertextHash: ciphertextHash(envelope.ciphertext), receivedAt: now, state: "delivered" }; this.nonceIndex.add(replayKey); this.messages.set(id, message); return message; }
    list(recipientNamehash) { return [...this.messages.values()].filter(message => message.envelope.recipientNamehash === recipientNamehash && message.state !== "deleted").sort((a, b) => b.receivedAt - a.receivedAt); }
    markRead(id, now = Math.floor(Date.now() / 1000)) { const message = this.require(id); message.readAt = now; return message; }
    acknowledge(id) { const message = this.require(id); message.state = "acknowledged"; return message; }
    archive(id) { const message = this.require(id); message.state = "archived"; return message; }
    delete(id) { const message = this.require(id); message.state = "deleted"; return message; }
    block(recipientNamehash, sender) { const senders = this.blocked.get(recipientNamehash) ?? new Set(); senders.add(sender.toLowerCase()); this.blocked.set(recipientNamehash, senders); }
    require(id) { const message = this.messages.get(id); if (!message)
        throw new Error("Encrypted mail metadata was not found."); return message; }
}

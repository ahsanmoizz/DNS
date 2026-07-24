import { createHash } from "node:crypto";
import { z } from "zod";
export const Envelope = z.object({ from: z.string(), recipientNamehash: z.string().regex(/^0x[a-fA-F0-9]{64}$/), ciphertext: z.string().min(1), signature: z.string().min(1), nonce: z.string().min(1), deadline: z.number().int().positive() });
export function validateEnvelope(value, now = Math.floor(Date.now() / 1000)) { const envelope = Envelope.parse(value); if (envelope.deadline <= now)
    throw new Error("Encrypted mail envelope has expired."); return envelope; }
export function ciphertextHash(ciphertext) { return `0x${createHash("sha256").update(ciphertext).digest("hex")}`; }

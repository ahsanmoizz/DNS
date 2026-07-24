import assert from "node:assert/strict";
import test from "node:test";
import { MailRelay } from "../src/relay.js";
const envelope = { from: "0x0000000000000000000000000000000000000001", recipientNamehash: "0x" + "11".repeat(32), ciphertext: "ciphertext", signature: "0xsigned", nonce: "1", deadline: 4_000_000_000 };
test("prevents replay and respects recipient sender blocks", () => { const relay = new MailRelay(); const delivered = relay.submit(envelope); assert.equal(delivered.state, "delivered"); assert.throws(() => relay.submit(envelope), /Replay-protected/); relay.block(envelope.recipientNamehash, "0x0000000000000000000000000000000000000002"); assert.throws(() => relay.submit({ ...envelope, from: "0x0000000000000000000000000000000000000002", nonce: "2" }), /blocked/); });

import assert from "node:assert/strict";
import test from "node:test";
import { decryptForRecipient, decryptVault, encryptForRecipient, encryptVault, generateMailboxKeyPair, publicKeyHash } from "../src/index.js";

test("encrypts only for the recipient key and restores the local vault", async () => {
  const recipient = await generateMailboxKeyPair(2);
  const payload = await encryptForRecipient(recipient.publicKey, "private Daily Mail content", recipient.version);
  assert.equal(await decryptForRecipient(recipient.privateKey, payload), "private Daily Mail content");
  assert.match(await publicKeyHash(recipient.publicKey), /^0x[0-9a-f]{64}$/);
  const vault = await encryptVault({ key: recipient.privateKey, version: recipient.version }, "a recovery password that is long enough");
  assert.deepEqual(await decryptVault(vault, "a recovery password that is long enough"), { key: recipient.privateKey, version: recipient.version });
});

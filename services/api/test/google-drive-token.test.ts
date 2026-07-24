import assert from "node:assert/strict";
import test from "node:test";
import { DailyPersistence } from "../src/persistence.js";

test("encrypts Google Drive refresh tokens before persistence", () => {
  const store = new DailyPersistence("postgresql://daily:password@localhost:5432/daily", "test-secret".repeat(8));
  const token = "google-refresh-token";
  const encrypted = store.encryptDriveToken(token);
  assert.notEqual(encrypted, token);
  assert.equal(store.decryptDriveToken(encrypted), token);
  assert.throws(() => store.decryptDriveToken(`${encrypted}x`));
});

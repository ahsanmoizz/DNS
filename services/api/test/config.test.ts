import assert from "node:assert/strict";
import test from "node:test";

test("production configuration requires persistent infrastructure", async () => {
  const previous = { DATABASE_URL: process.env.DATABASE_URL, REDIS_URL: process.env.REDIS_URL, JWT_SECRET: process.env.JWT_SECRET, PORT: process.env.PORT, USER_APP_URL: process.env.USER_APP_URL, ADMIN_APP_URL: process.env.ADMIN_APP_URL, AUTHENTICATED_PREVIEW_APP_URL: process.env.AUTHENTICATED_PREVIEW_APP_URL };
  process.env.DATABASE_URL = "postgresql://daily:password@postgres:5432/daily";
  process.env.REDIS_URL = "redis://:password@redis:6379";
  process.env.JWT_SECRET = "a".repeat(32);
  process.env.PORT = "3000";
  process.env.USER_APP_URL = "https://user.example.test";
  process.env.ADMIN_APP_URL = "https://admin.example.test";
  process.env.AUTHENTICATED_PREVIEW_APP_URL = "https://preview.example.test";
  const { loadApiConfig } = await import("../src/config.js");
  assert.equal(loadApiConfig().port, 3000);
  process.env.JWT_SECRET = "short";
  assert.throws(() => loadApiConfig(), /JWT_SECRET/);
  Object.assign(process.env, previous);
});

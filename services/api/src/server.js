import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { randomBytes } from "node:crypto";
import { verifyMessage } from "ethers";
import { DAILY_NETWORKS, DailyContracts, SEPOLIA_CONTRACTS, normalizeName } from "@daily/sdk";
import { z } from "zod";
import { MailRelay } from "@daily/mail-relay";
const app = Fastify({ logger: true });
const nonces = new Map();
const contracts = new DailyContracts();
const relay = new MailRelay();
await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || "development-only-replace-me" });
app.get("/health", async () => ({ ok: true, network: DAILY_NETWORKS.sepolia, contracts: SEPOLIA_CONTRACTS }));
app.post("/v1/auth/challenge", async (request) => { const { address } = z.object({ address: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }).parse(request.body); const value = `Daily Identity login\nNonce: ${randomBytes(16).toString("hex")}`; nonces.set(address.toLowerCase(), { value, expiresAt: Date.now() + 5 * 60_000 }); return { message: value }; });
app.post("/v1/auth/verify", async (request, reply) => { const { address, signature } = z.object({ address: z.string(), signature: z.string() }).parse(request.body); const challenge = nonces.get(address.toLowerCase()); if (!challenge || challenge.expiresAt < Date.now() || verifyMessage(challenge.value, signature).toLowerCase() !== address.toLowerCase())
    return reply.code(401).send({ error: "Invalid or expired wallet signature." }); nonces.delete(address.toLowerCase()); return { token: await reply.jwtSign({ sub: address.toLowerCase() }) }; });
app.get("/v1/names/search/:label", async (request) => ({ results: await contracts.search(request.params.label) }));
app.get("/v1/names/:name", async (request) => ({ name: normalizeName(request.params.name), ...(await contracts.resolve(request.params.name)) }));
app.post("/v1/mail/envelopes", async (request, reply) => { await request.jwtVerify(); const body = z.object({ from: z.string().regex(/^0x[a-fA-F0-9]{40}$/), recipientNamehash: z.string().regex(/^0x[a-fA-F0-9]{64}$/), ciphertext: z.string().min(1), signature: z.string().min(1), nonce: z.string().min(1), deadline: z.number().int().positive() }).parse(request.body); const actor = request.user.sub; if (actor.toLowerCase() !== body.from.toLowerCase())
    return reply.code(403).send({ error: "Envelope sender must match the authenticated wallet." }); return reply.code(202).send(relay.submit(body)); });
app.get("/v1/mail/:namehash", async (request) => { await request.jwtVerify(); return { messages: relay.list(request.params.namehash) }; });
app.post("/v1/mail/:id/:action", async (request, reply) => { await request.jwtVerify(); const { id, action } = request.params; if (action === "read")
    return relay.markRead(id); if (action === "acknowledge")
    return relay.acknowledge(id); if (action === "archive")
    return relay.archive(id); if (action === "delete")
    return relay.delete(id); return reply.code(400).send({ error: "Unsupported mail action." }); });
app.post("/v1/evidence", async (request, reply) => { await request.jwtVerify(); return reply.code(501).send({ error: "Encrypted evidence adapter is configured during service deployment; plaintext uploads are never accepted." }); });
app.listen({ host: "0.0.0.0", port: Number(process.env.PORT || 3000) });

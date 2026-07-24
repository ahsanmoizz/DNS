import assert from "node:assert/strict";
import test from "node:test";
import { indexFinalizedEvents, type EventStore, type IndexedEvent } from "../src/indexer.js";

class MemoryStore implements EventStore { events = new Map<string, IndexedEvent>(); blocks: number[] = []; async has(event: IndexedEvent) { return this.events.has(`${event.transactionHash}:${event.logIndex}`); } async save(event: IndexedEvent) { this.events.set(`${event.transactionHash}:${event.logIndex}`, event); } async checkpoint(_chain: number, block: number) { this.blocks.push(block); } }
test("indexes each chain log once and advances checkpoints", async () => { const store = new MemoryStore(); const event = { chainId: 11155111, blockNumber: 100, transactionHash: "0xabc", logIndex: 0, event: "registry.OwnerChanged", payload: {} }; assert.equal(await indexFinalizedEvents(store, [event, event]), 1); assert.equal(store.events.size, 1); assert.deepEqual(store.blocks, [100]); });

import pg from "pg";
import type { EventStore, IndexedEvent } from "./indexer.js";

export class PostgresEventStore implements EventStore {
  constructor(private readonly pool: pg.Pool) {}
  async has(event: IndexedEvent) { return ((await this.pool.query("SELECT 1 FROM indexed_events WHERE chain_id=$1 AND transaction_hash=$2 AND log_index=$3", [event.chainId, event.transactionHash, event.logIndex])).rowCount ?? 0) > 0; }
  async save(event: IndexedEvent) { await this.pool.query("INSERT INTO indexed_events(chain_id,block_number,transaction_hash,log_index,event_name,payload) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING", [event.chainId, event.blockNumber, event.transactionHash, event.logIndex, event.event, event.payload]); }
  async checkpoint(chainId: number, blockNumber: number) { await this.pool.query("INSERT INTO indexer_checkpoints(chain_id,block_number) VALUES($1,$2) ON CONFLICT(chain_id) DO UPDATE SET block_number=GREATEST(indexer_checkpoints.block_number, EXCLUDED.block_number),updated_at=now()", [chainId, blockNumber]); }
  async readCheckpoint(chainId: number) { const result = await this.pool.query<{ block_number: string }>("SELECT block_number FROM indexer_checkpoints WHERE chain_id=$1", [chainId]); return result.rowCount ? Number(result.rows[0].block_number) : undefined; }
}

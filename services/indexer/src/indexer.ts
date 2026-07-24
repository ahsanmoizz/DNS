import { Contract, JsonRpcProvider, type Log } from "ethers";

export interface IndexedEvent { chainId: number; blockNumber: number; transactionHash: string; logIndex: number; event: string; payload: Record<string, unknown>; }
export interface EventStore { has(event: IndexedEvent): Promise<boolean>; save(event: IndexedEvent): Promise<void>; checkpoint(chainId: number, blockNumber: number): Promise<void>; readCheckpoint?(chainId: number): Promise<number | undefined>; }
export interface IndexerContract { name: string; address: string; abi: readonly string[]; }
export type IndexerOptions = { confirmations?: number; chunkSize?: number; startBlock?: number };

export async function indexFinalizedEvents(store: EventStore, events: IndexedEvent[]): Promise<number> {
  let saved = 0;
  for (const event of events) { if (await store.has(event)) continue; await store.save(event); await store.checkpoint(event.chainId, event.blockNumber); saved += 1; }
  return saved;
}

/** Finds the first block at which deployed bytecode exists. It avoids trusting a manually copied deployment block. */
export async function deploymentBlock(provider: JsonRpcProvider, address: string, head?: number): Promise<number> {
  const targetHead = head ?? await provider.getBlockNumber();
  if (await provider.getCode(address, targetHead) === "0x") throw new Error(`No deployed bytecode at ${address}.`);
  let low = 0; let high = targetHead;
  while (low < high) { const middle = Math.floor((low + high) / 2); if (await provider.getCode(address, middle) === "0x") low = middle + 1; else high = middle; }
  return low;
}

export async function runIndexer(provider: JsonRpcProvider, store: EventStore, contracts: readonly IndexerContract[], options: IndexerOptions = {}): Promise<{ fromBlock: number; toBlock: number; indexed: number }> {
  const network = await provider.getNetwork(); const chainId = Number(network.chainId); const confirmations = options.confirmations ?? 8; const chunkSize = options.chunkSize ?? 2_000;
  if (!Number.isInteger(confirmations) || confirmations < 1) throw new Error("Indexer confirmations must be at least one.");
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 10_000) throw new Error("Indexer chunk size must be between 1 and 10,000 blocks.");
  const head = await provider.getBlockNumber(); const finalizedHead = head - confirmations;
  if (finalizedHead < 0) return { fromBlock: 0, toBlock: -1, indexed: 0 };
  const checkpoint = await store.readCheckpoint?.(chainId);
  const derivedStart = options.startBlock ?? Math.min(...await Promise.all(contracts.map(contract => deploymentBlock(provider, contract.address, finalizedHead))));
  let fromBlock = checkpoint === undefined ? derivedStart : Math.max(derivedStart, checkpoint + 1); let indexed = 0;
  while (fromBlock <= finalizedHead) {
    const toBlock = Math.min(fromBlock + chunkSize - 1, finalizedHead);
    const events = (await Promise.all(contracts.map(contract => readContractEvents(provider, network.chainId, contract, fromBlock, toBlock)))).flat();
    indexed += await indexFinalizedEvents(store, events);
    await store.checkpoint(chainId, toBlock); fromBlock = toBlock + 1;
  }
  return { fromBlock: checkpoint === undefined ? derivedStart : Math.max(derivedStart, checkpoint + 1), toBlock: finalizedHead, indexed };
}

async function readContractEvents(provider: JsonRpcProvider, chainId: bigint, contract: IndexerContract, fromBlock: number, toBlock: number): Promise<IndexedEvent[]> {
  const reader = new Contract(contract.address, contract.abi, provider);
  const logs = await provider.getLogs({ address: contract.address, fromBlock, toBlock });
  return logs.flatMap(log => decodeLog(reader, Number(chainId), contract.name, log));
}
function decodeLog(reader: Contract, chainId: number, module: string, log: Log): IndexedEvent[] {
  try {
    const parsed = reader.interface.parseLog(log); if (!parsed) return [];
    const payload = jsonSafe(Object.fromEntries(parsed.fragment.inputs.map((input, index) => [input.name || String(index), parsed.args[index]])));
    return [{ chainId, blockNumber: log.blockNumber, transactionHash: log.transactionHash, logIndex: log.index, event: `${module}.${parsed.name}`, payload }];
  } catch { return []; }
}
function jsonSafe(value: unknown): Record<string, unknown> { return JSON.parse(JSON.stringify(value, (_key, child) => typeof child === "bigint" ? child.toString() : child)) as Record<string, unknown>; }

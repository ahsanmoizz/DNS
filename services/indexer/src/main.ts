import dotenv from "dotenv";
import { JsonRpcProvider } from "ethers";
import pg from "pg";
import { resolve } from "node:path";
import { runIndexer, type IndexerContract } from "./indexer.js";
import { PostgresEventStore } from "./postgres-store.js";

dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });
const contracts = JSON.parse(await (await import("node:fs/promises")).readFile(resolve(import.meta.dirname, "../../../packages/contracts/deployments/sepolia.json"), "utf8"));
if (!process.env.DATABASE_URL || !process.env.SEPOLIA_TESTNET_RPC_URL) throw new Error("DATABASE_URL and SEPOLIA_TESTNET_RPC_URL are required.");
const registrarAbi = ["event NameRegistered(string name,bytes32 indexed node,address indexed owner,uint64 expiry,uint256 price)", "event NameRenewed(bytes32 indexed node,uint64 expiry,uint256 price)", "event CommitmentMade(bytes32 indexed commitment)", "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)", "event CatalogUpdated(bytes32 indexed labelhash,uint8 category)", "event CatalogRuleUpdated(uint256 indexed ruleId,string keyword,uint8 category,uint8 matchType,bool active)"];
const modules: IndexerContract[] = [
  { name: "registry", address: contracts.registry, abi: ["event OwnerChanged(bytes32 indexed node,address indexed owner)", "event ResolverChanged(bytes32 indexed node,address indexed resolver)", "event TTLChanged(bytes32 indexed node,uint64 ttl)"] },
  { name: "resolver", address: contracts.resolver, abi: ["event AddrChanged(bytes32 indexed node,uint256 indexed coinType,bytes value)", "event TextChanged(bytes32 indexed node,string indexed key,string value)", "event ContenthashChanged(bytes32 indexed node,bytes value)", "event MailKeyChanged(bytes32 indexed node,bytes32 hash,uint32 version)"] },
  ...(contracts.reverseResolver ? [{ name: "reverseResolver", address: String(contracts.reverseResolver), abi: ["event ReverseNameChanged(address indexed account,bytes32 indexed node,string name)"] }] : []),
  ...Object.entries(contracts.registrars).map(([tld, address]) => ({ name: `registrar.${tld}`, address: String(address), abi: registrarAbi })),
  { name: "campaignEscrow", address: contracts.campaignEscrow, abi: ["event CampaignFunded(bytes32 indexed campaignId,address indexed marketer,uint256 rewardBudget,uint256 platformFee,uint64 deadline)", "event RewardPaid(bytes32 indexed campaignId,address indexed recipient,uint256 amount)", "event RewardRootSet(bytes32 indexed campaignId,bytes32 indexed root)", "event RewardClaimed(bytes32 indexed campaignId,uint256 indexed index,address indexed recipient,uint256 amount)", "event CampaignBlocked(bytes32 indexed campaignId)", "event RefundClaimed(bytes32 indexed campaignId,uint256 amount)"] }
];
const interval = Number(process.env.INDEXER_POLL_INTERVAL_MS ?? 15_000);
if (!Number.isInteger(interval) || interval < 5_000) throw new Error("INDEXER_POLL_INTERVAL_MS must be at least 5000.");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const provider = new JsonRpcProvider(process.env.SEPOLIA_TESTNET_RPC_URL);
const store = new PostgresEventStore(pool);
for (;;) {
  try { console.log(JSON.stringify(await runIndexer(provider, store, modules), null, 2)); }
  catch (error) { console.error("Indexer pass failed; retrying.", error); }
  await new Promise(resolve => setTimeout(resolve, interval));
}

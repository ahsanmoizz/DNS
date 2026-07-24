/* Execute a prepared, timelock-owned migration batch from a reviewed JSON plan. */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const { Contract, JsonRpcProvider, Wallet, isAddress } = require("../../../packages/sdk/node_modules/ethers");

const TIMELOCK_ABI = ["function scheduleBatch(address[] targets,uint256[] values,bytes[] payloads,bytes32 predecessor,bytes32 salt,uint256 delay)", "function executeBatch(address[] targets,uint256[] values,bytes[] payloads,bytes32 predecessor,bytes32 salt) payable", "function getMinDelay() view returns (uint256)"];
async function main() {
  const planPath = process.argv[2];
  const mode = process.argv[3] ?? "schedule";
  if (!planPath || !["schedule", "execute"].includes(mode)) throw new Error("Usage: node migrate-protocol.cjs <reviewed-plan.json> <schedule|execute>");
  const plan = JSON.parse(fs.readFileSync(path.resolve(planPath), "utf8"));
  if (!process.env.SEPOLIA_TESTNET_RPC_URL || !process.env.DEPLOYER_PRIVATE_KEY || !isAddress(process.env.SEPOLIA_PROTOCOL_TIMELOCK ?? "")) throw new Error("SEPOLIA_TESTNET_RPC_URL, DEPLOYER_PRIVATE_KEY, and SEPOLIA_PROTOCOL_TIMELOCK are required.");
  if (!Array.isArray(plan.targets) || !Array.isArray(plan.values) || !Array.isArray(plan.payloads) || plan.targets.length === 0 || plan.targets.length !== plan.values.length || plan.targets.length !== plan.payloads.length) throw new Error("Migration plan must contain matching non-empty targets, values, and payloads arrays.");
  if (!plan.targets.every(isAddress) || !plan.values.every(value => /^\d+$/.test(String(value))) || !plan.payloads.every(value => /^0x[0-9a-fA-F]*$/.test(value))) throw new Error("Migration plan contains an invalid target, value, or calldata payload.");
  if (!/^0x[0-9a-fA-F]{64}$/.test(plan.predecessor ?? "") || !/^0x[0-9a-fA-F]{64}$/.test(plan.salt ?? "")) throw new Error("Migration plan must include bytes32 predecessor and salt values.");
  const signer = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, new JsonRpcProvider(process.env.SEPOLIA_TESTNET_RPC_URL));
  const timelock = new Contract(process.env.SEPOLIA_PROTOCOL_TIMELOCK, TIMELOCK_ABI, signer);
  const values = plan.values.map(value => BigInt(value));
  if (mode === "schedule") { const delay = plan.delay ?? await timelock.getMinDelay(); await (await timelock.scheduleBatch(plan.targets, values, plan.payloads, plan.predecessor, plan.salt, delay)).wait(); }
  else await (await timelock.executeBatch(plan.targets, values, plan.payloads, plan.predecessor, plan.salt)).wait();
  console.log(JSON.stringify({ mode, timelock: process.env.SEPOLIA_PROTOCOL_TIMELOCK, plan: path.resolve(planPath) }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });

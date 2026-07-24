const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const { JsonRpcProvider } = require("../../../packages/sdk/node_modules/ethers");

async function main() {
  const rpc = process.env.SEPOLIA_TESTNET_RPC_URL;
  if (!rpc) throw new Error("SEPOLIA_TESTNET_RPC_URL is required.");
  const manifestPath = path.resolve(__dirname, "../deployments/sepolia.json");
  if (!fs.existsSync(manifestPath)) throw new Error("Sepolia address manifest is missing; deploy before verifying.");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n || manifest.chainId !== 11155111) throw new Error("Sepolia chain ID verification failed.");
  const contracts = { registry: manifest.registry, ...(manifest.contractRegistry ? { contractRegistry: manifest.contractRegistry } : {}), resolver: manifest.resolver, ...(manifest.reverseResolver ? { reverseResolver: manifest.reverseResolver } : {}), ...(manifest.mailAnchor ? { mailAnchor: manifest.mailAnchor } : {}), ...(manifest.bundleCoordinator ? { bundleCoordinator: manifest.bundleCoordinator } : {}), ...Object.fromEntries(Object.entries(manifest.registrars).map(([tld, address]) => [`registrar.${tld}`, address])), campaignEscrow: manifest.campaignEscrow };
  const results = {};
  for (const [name, address] of Object.entries(contracts)) {
    const bytecode = await provider.getCode(address);
    results[name] = { address, deployed: bytecode !== "0x", bytecodeBytes: (bytecode.length - 2) / 2 };
    if (bytecode === "0x") throw new Error(`${name} has no deployed bytecode at ${address}.`);
  }
  console.log(JSON.stringify({ verifiedAt: new Date().toISOString(), network: "sepolia", chainId: Number(network.chainId), contracts: results }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });

/* Resume a partially completed Sepolia deployment without redeploying contracts. */
const fs = require("fs"); const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const { Contract, ContractFactory, JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } = require("../../../packages/sdk/node_modules/ethers");
const root = path.resolve(__dirname, ".."); const artifact = (name) => JSON.parse(fs.readFileSync(path.join(root, "build", "contracts", `${name}.json`), "utf8"));
async function main() {
  const provider = new JsonRpcProvider(process.env.SEPOLIA_TESTNET_RPC_URL); if ((await provider.getNetwork()).chainId !== 11155111n) throw new Error("Sepolia RPC is required.");
  const signer = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider); const registryAddress = "0xF8e44c6e1f472Ac49fbe1F5E8d16011cAb2FB586"; const resolver = "0x1b551534E3BD30f7f7804693577071DE78159639";
  const registrars = { dly: "0x0360CE9a6eca0447e4A6510232498F5b0d99b404", day: "0x2f5012D9b0851BaD8d29469E5D3eA70BE67F8fEF", daily: "0xBCEB2724639D05c064b4F3C05a9540BD54a817AE" };
  const registry = new Contract(registryAddress, artifact("DailyRegistry").abi, signer); const role = keccak256(toUtf8Bytes("REGISTRAR_ROLE"));
  for (const address of Object.values(registrars)) if (!(await registry.hasRole(role, address))) await (await registry.grantRole(role, address)).wait();
  const campaignSource = artifact("DailyCampaignEscrow"); const campaign = await new ContractFactory(campaignSource.abi, campaignSource.bytecode, signer).deploy(await signer.getAddress(), await signer.getAddress()); await campaign.waitForDeployment();
  const manifest = { network: "sepolia", chainId: 11155111, deployedAt: new Date().toISOString(), deployer: await signer.getAddress(), registry: registryAddress, resolver, registrars, campaignEscrow: await campaign.getAddress() };
  const out = path.join(root, "deployments"); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, "sepolia.json"), JSON.stringify(manifest, null, 2)); console.log(JSON.stringify(manifest, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });

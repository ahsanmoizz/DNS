const DailyRegistry = artifacts.require("DailyRegistry");
const DailyContractRegistry = artifacts.require("DailyContractRegistry");
const DailyResolver = artifacts.require("DailyResolver");
const DailyReverseResolver = artifacts.require("DailyReverseResolver");
const DailyMailAnchor = artifacts.require("DailyMailAnchor");
const DailyBundleCoordinator = artifacts.require("DailyBundleCoordinator");
const DailyNameRegistrar = artifacts.require("DailyNameRegistrar");
const DailyCampaignEscrow = artifacts.require("DailyCampaignEscrow");
const fs = require("fs"); const path = require("path");
module.exports = async function (deployer, network, accounts) {
  if (network !== "sepolia") throw new Error("Only Sepolia deployment is permitted until Daily Testnet is restored.");
  const admin = accounts[0];
  await deployer.deploy(DailyRegistry, admin); const registry = await DailyRegistry.deployed(); await deployer.deploy(DailyContractRegistry, admin); const contractRegistry = await DailyContractRegistry.deployed();
  await deployer.deploy(DailyResolver, registry.address, admin); await deployer.deploy(DailyReverseResolver, registry.address); await deployer.deploy(DailyMailAnchor, admin); const registrars = {};
  for (const tld of ["dly", "day", "daily"]) { const tldNode = web3.utils.soliditySha3(tld); await deployer.deploy(DailyNameRegistrar, `Daily ${tld}`, `D${tld.toUpperCase()}`, tld, registry.address, tldNode, admin, admin); const registrar = await DailyNameRegistrar.deployed(); await registry.grantRole(await registry.REGISTRAR_ROLE(), registrar.address, { from: admin }); registrars[tld] = registrar.address; }
  await deployer.deploy(DailyBundleCoordinator, admin, registrars.dly, registrars.day, registrars.daily); const bundleCoordinator = await DailyBundleCoordinator.deployed(); const bundleOperatorRole = web3.utils.keccak256("BUNDLE_OPERATOR_ROLE"); for (const registrarAddress of Object.values(registrars)) { const registrar = await DailyNameRegistrar.at(registrarAddress); await registrar.grantRole(bundleOperatorRole, bundleCoordinator.address, { from: admin }); }
  await deployer.deploy(DailyCampaignEscrow, admin, admin);
  const resolver = await DailyResolver.deployed(); const reverseResolver = await DailyReverseResolver.deployed(); const mailAnchor = await DailyMailAnchor.deployed(); const campaignEscrow = await DailyCampaignEscrow.deployed();
  const addresses = { registry: registry.address, resolver: resolver.address, reverseResolver: reverseResolver.address, mailAnchor: mailAnchor.address, bundleCoordinator: bundleCoordinator.address, campaignEscrow: campaignEscrow.address, ...Object.fromEntries(Object.entries(registrars).map(([tld, address]) => [`registrar.${tld}`, address])) };
  for (const [key, address] of Object.entries(addresses)) await contractRegistry.setAddress(web3.utils.keccak256(key), address, { from: admin });
  const manifest = { network: "sepolia", chainId: 11155111, deployedAt: new Date().toISOString(), contractRegistry: contractRegistry.address, ...addresses, registrars };
  fs.mkdirSync(path.resolve(__dirname, "../deployments"), { recursive: true }); fs.writeFileSync(path.resolve(__dirname, "../deployments/sepolia.json"), JSON.stringify(manifest, null, 2));
};

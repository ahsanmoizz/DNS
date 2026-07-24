require("dotenv").config({ path: "../../.env" });
const provider = () => {
  if (!process.env.DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY is required for Testnet deployment.");
  let HDWalletProvider; try { HDWalletProvider = require("@truffle/hdwallet-provider"); } catch { throw new Error("Install @truffle/hdwallet-provider locally before Testnet deployment."); }
  return new HDWalletProvider({ privateKeys: [process.env.DEPLOYER_PRIVATE_KEY], providerOrUrl: process.env.SEPOLIA_TESTNET_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com" });
};
module.exports = { networks: { development: { host: "127.0.0.1", port: 8545, network_id: "*" }, sepolia: { provider, network_id: 11155111, confirmations: 2, timeoutBlocks: 100, skipDryRun: true } }, compilers: { solc: { version: "0.8.24", settings: { evmVersion: "cancun", optimizer: { enabled: true, runs: 200 } } } } };

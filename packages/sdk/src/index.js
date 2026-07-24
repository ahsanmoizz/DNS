import { TypedDataEncoder, concat, getAddress, id, isAddress, keccak256 } from "ethers";
export { SEPOLIA_CONTRACTS } from "./sepolia.js";
export { DailyContracts } from "./contracts.js";
export { decryptForRecipient, decryptVault, encryptForRecipient, encryptVault, generateMailboxKeyPair, publicKeyHash } from "./mail-crypto.js";
export { GoogleDriveCiphertextStorage, OneDriveApprovalRequired } from "./storage.js";
export const DAILY_NETWORKS = {
    sepolia: { chainId: 11155111, name: "Sepolia Testnet", rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com", explorerUrl: "https://sepolia.etherscan.io", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, deployable: true },
    dailyTestnet: { chainId: 825, name: "Daily Network Testnet", rpcUrl: "https://rpc.testnet.dailycrypto.net", explorerUrl: "https://explorer.testnet.dailycrypto.net", nativeCurrency: { name: "DLY", symbol: "DLY", decimals: 18 }, deployable: false },
    dailyMainnet: { chainId: 824, name: "Daily Network", rpcUrl: "https://rpc.mainnet.dailycrypto.net", explorerUrl: "https://explorer.dailycrypto.net", nativeCurrency: { name: "DLY", symbol: "DLY", decimals: 18 }, deployable: false }
};
export const MAIL_ENVELOPE_TYPES = { MailEnvelope: [{ name: "from", type: "address" }, { name: "toNamehash", type: "bytes32" }, { name: "ciphertextHash", type: "bytes32" }, { name: "nonce", type: "uint256" }, { name: "deadline", type: "uint256" }] };
export const ENGAGEMENT_TYPES = { EngagementReceipt: [{ name: "campaignId", type: "bytes32" }, { name: "action", type: "uint8" }, { name: "recipient", type: "address" }, { name: "nonce", type: "uint256" }, { name: "deadline", type: "uint256" }] };
export function normalizeLabel(input) {
    const value = input.trim().toLowerCase();
    if (!/^[a-z0-9-]{1,63}$/.test(value) || value.startsWith("-") || value.endsWith("-"))
        throw new Error("Daily labels use lowercase letters, digits and internal hyphens only.");
    return value;
}
export function normalizeName(name) { const [label, tld, ...rest] = name.trim().toLowerCase().split("."); if (rest.length || !["dly", "day", "daily"].includes(tld))
    throw new Error("Use .dly, .day or .daily."); return `${normalizeLabel(label)}.${tld}`; }
export function namehash(name) { let node = "0x" + "00".repeat(32); for (const label of normalizeName(name).split(".").reverse())
    node = keccak256(concat([node, id(label)])); return node; }
export function dailyPaymentUri(receivingName, amount, memo, expiresAt) { return `daily:${encodeURIComponent(normalizeName(receivingName))}?amount=${encodeURIComponent(amount)}&memo=${encodeURIComponent(memo)}&expires=${expiresAt}`; }
export function maskedAddress(address) { const normalized = getAddress(address); return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`; }
export function verifiedAddress(address) { if (!isAddress(address))
    throw new Error("Invalid resolved wallet address."); return getAddress(address); }
export function typedDataHash(domain, types, value) { return TypedDataEncoder.hash(domain, types, value); }

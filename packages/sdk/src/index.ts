import { TypedDataEncoder, concat, getAddress, id, isAddress, keccak256 } from "ethers";
export { SEPOLIA_CONTRACTS } from "./sepolia.js";
export { DailyContracts, configureDailyContracts } from "./contracts.js";
export type { DailyContractAddresses, NameSearchResult, RegistrationIntent } from "./contracts.js";
export { decryptForRecipient, decryptVault, encryptForRecipient, encryptVault, generateMailboxKeyPair, publicKeyHash } from "./mail-crypto.js";
export type { EncryptedPayload, EncryptedVault, MailKeyPair } from "./mail-crypto.js";
export { createCiphertextStorage, GoogleDriveCiphertextStorage, IpfsCiphertextStorage, OneDriveApprovalRequired, S3CompatibleCiphertextStorage } from "./storage.js";
export type { CiphertextStorageAdapter, CiphertextStorageSelection } from "./storage.js";

export const DAILY_NETWORKS = {
  sepolia: { chainId: 11155111, name: "Sepolia Testnet", rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com", explorerUrl: "https://sepolia.etherscan.io", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, deployable: true },
  dailyTestnet: { chainId: 825, name: "Daily Network Testnet", rpcUrl: "https://rpc.testnet.dailycrypto.net", explorerUrl: "https://explorer.testnet.dailycrypto.net", nativeCurrency: { name: "DLY", symbol: "DLY", decimals: 18 }, deployable: false },
  dailyMainnet: { chainId: 824, name: "Daily Network", rpcUrl: "https://rpc.mainnet.dailycrypto.net", explorerUrl: "https://explorer.dailycrypto.net", nativeCurrency: { name: "DLY", symbol: "DLY", decimals: 18 }, deployable: false }
} as const;

export type DailyNetwork = keyof typeof DAILY_NETWORKS;
export const MAIL_ENVELOPE_TYPES: Record<string, { name: string; type: string }[]> = { MailEnvelope: [{ name: "from", type: "address" }, { name: "toNamehash", type: "bytes32" }, { name: "ciphertextHash", type: "bytes32" }, { name: "nonce", type: "uint256" }, { name: "deadline", type: "uint256" }] };
export const MAIL_ACKNOWLEDGEMENT_TYPES: Record<string, { name: string; type: string }[]> = { MailAcknowledgement: [{ name: "messageId", type: "string" }, { name: "recipientNamehash", type: "bytes32" }, { name: "deadline", type: "uint256" }] };
export const ENGAGEMENT_TYPES = { EngagementReceipt: [{ name: "campaignId", type: "bytes32" }, { name: "action", type: "uint8" }, { name: "recipient", type: "address" }, { name: "nonce", type: "uint256" }, { name: "deadline", type: "uint256" }] } as const;

export function normalizeLabel(input: string): string {
  const value = input.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,63}$/.test(value) || value.startsWith("-") || value.endsWith("-")) throw new Error("Daily labels use lowercase letters, digits and internal hyphens only.");
  return value;
}
/** ENSIP-15-compatible safety boundary for the ASCII-only Daily namespace. */
export function inspectLabelSafety(input: string) {
  const trimmed = input.trim(); const normalized = trimmed.normalize("NFC");
  if (normalized !== trimmed) return { safe: false, reason: "Use the canonical NFC form of this label." } as const;
  if (/[^\x00-\x7F]/.test(normalized)) return { safe: false, reason: "Unicode and visually confusable characters are not supported in the Daily ASCII namespace." } as const;
  try { return { safe: true, label: normalizeLabel(normalized) } as const; } catch (error) { return { safe: false, reason: error instanceof Error ? error.message : "Unsafe Daily label." } as const; }
}
export function suggestLabels(input: string): string[] {
  const base = input.trim().toLowerCase().normalize("NFKD").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 55);
  if (!base) return []; return [base, `${base}-id`, `${base}-app`, `${base}-daily`].filter((value, index, values) => values.indexOf(value) === index && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value));
}
export function normalizeName(name: string): string { const [label, tld, ...rest] = name.trim().toLowerCase().split("."); if (rest.length || !["dly", "day", "daily"].includes(tld)) throw new Error("Use .dly, .day or .daily."); return `${normalizeLabel(label)}.${tld}`; }
export function namehash(name: string): string { let node = "0x" + "00".repeat(32); for (const label of normalizeName(name).split(".").reverse()) node = keccak256(concat([node, id(label)])); return node; }
export type DailyPaymentRequest = { receivingName: string; amount: string; memo: string; expiresAt: number };
export function dailyPaymentUri(receivingName: string, amount: string, memo: string, expiresAt: number): string { if (!/^\d+(?:\.\d{1,18})?$/.test(amount) || Number(amount) <= 0) throw new Error("Payment amount must be a positive native-currency decimal with at most 18 places."); if (!Number.isInteger(expiresAt) || expiresAt <= 0) throw new Error("Payment expiry must be a Unix timestamp."); return `daily:${encodeURIComponent(normalizeName(receivingName))}?amount=${encodeURIComponent(amount)}&memo=${encodeURIComponent(memo)}&expires=${expiresAt}`; }
export function parseDailyPaymentUri(uri: string): DailyPaymentRequest { const match = uri.match(/^daily:([^?]+)\?(.+)$/); if (!match) throw new Error("Invalid Daily payment URI."); const query = new URLSearchParams(match[2]); const amount = query.get("amount") ?? ""; const memo = query.get("memo") ?? ""; const expiresAt = Number(query.get("expires")); if (!/^\d+(?:\.\d{1,18})?$/.test(amount) || Number(amount) <= 0 || !Number.isInteger(expiresAt) || expiresAt <= 0) throw new Error("Invalid Daily payment request values."); return { receivingName: normalizeName(decodeURIComponent(match[1])), amount, memo, expiresAt }; }
export function maskedAddress(address: string): string { const normalized = getAddress(address); return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`; }
export function verifiedAddress(address: string): string { if (!isAddress(address)) throw new Error("Invalid resolved wallet address."); return getAddress(address); }
export function typedDataHash(domain: Record<string, unknown>, types: Record<string, readonly { name: string; type: string }[]>, value: Record<string, unknown>): string { return TypedDataEncoder.hash(domain, types as Record<string, { name: string; type: string }[]>, value); }

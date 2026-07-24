export { SEPOLIA_CONTRACTS } from "./sepolia.js";
export { DailyContracts } from "./contracts.js";
export type { NameSearchResult, RegistrationIntent } from "./contracts.js";
export { decryptForRecipient, decryptVault, encryptForRecipient, encryptVault, generateMailboxKeyPair, publicKeyHash } from "./mail-crypto.js";
export type { EncryptedPayload, EncryptedVault, MailKeyPair } from "./mail-crypto.js";
export { GoogleDriveCiphertextStorage, OneDriveApprovalRequired } from "./storage.js";
export type { CiphertextStorageAdapter } from "./storage.js";
export declare const DAILY_NETWORKS: {
    readonly sepolia: {
        readonly chainId: 11155111;
        readonly name: "Sepolia Testnet";
        readonly rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com";
        readonly explorerUrl: "https://sepolia.etherscan.io";
        readonly nativeCurrency: {
            readonly name: "Ether";
            readonly symbol: "ETH";
            readonly decimals: 18;
        };
        readonly deployable: true;
    };
    readonly dailyTestnet: {
        readonly chainId: 825;
        readonly name: "Daily Network Testnet";
        readonly rpcUrl: "https://rpc.testnet.dailycrypto.net";
        readonly explorerUrl: "https://explorer.testnet.dailycrypto.net";
        readonly nativeCurrency: {
            readonly name: "DLY";
            readonly symbol: "DLY";
            readonly decimals: 18;
        };
        readonly deployable: false;
    };
    readonly dailyMainnet: {
        readonly chainId: 824;
        readonly name: "Daily Network";
        readonly rpcUrl: "https://rpc.mainnet.dailycrypto.net";
        readonly explorerUrl: "https://explorer.dailycrypto.net";
        readonly nativeCurrency: {
            readonly name: "DLY";
            readonly symbol: "DLY";
            readonly decimals: 18;
        };
        readonly deployable: false;
    };
};
export type DailyNetwork = keyof typeof DAILY_NETWORKS;
export declare const MAIL_ENVELOPE_TYPES: {
    readonly MailEnvelope: readonly [{
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly name: "toNamehash";
        readonly type: "bytes32";
    }, {
        readonly name: "ciphertextHash";
        readonly type: "bytes32";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }];
};
export declare const ENGAGEMENT_TYPES: {
    readonly EngagementReceipt: readonly [{
        readonly name: "campaignId";
        readonly type: "bytes32";
    }, {
        readonly name: "action";
        readonly type: "uint8";
    }, {
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }];
};
export declare function normalizeLabel(input: string): string;
export declare function normalizeName(name: string): string;
export declare function namehash(name: string): string;
export declare function dailyPaymentUri(receivingName: string, amount: string, memo: string, expiresAt: number): string;
export declare function maskedAddress(address: string): string;
export declare function verifiedAddress(address: string): string;
export declare function typedDataHash(domain: Record<string, unknown>, types: Record<string, readonly {
    name: string;
    type: string;
}[]>, value: Record<string, unknown>): string;

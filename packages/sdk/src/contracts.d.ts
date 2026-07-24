import { BrowserProvider, JsonRpcProvider, type ContractRunner } from "ethers";
export type NameSearchResult = {
    name: string;
    tld: "dly" | "day" | "daily";
    node: string;
    status: "available" | "premium" | "reserved" | "official" | "owned";
    priceWei?: bigint;
    expiresAt?: number;
};
export type RegistrationIntent = {
    label: string;
    tld: "dly" | "day" | "daily";
    durationSeconds: bigint;
    secret: string;
    commitment: string;
    priceWei: bigint;
};
export declare class DailyContracts {
    readonly provider: JsonRpcProvider | BrowserProvider;
    constructor(provider?: JsonRpcProvider | BrowserProvider);
    private registrar;
    search(labelInput: string, durationSeconds?: bigint): Promise<NameSearchResult[]>;
    createRegistration(labelInput: string, tld: "dly" | "day" | "daily", owner: string, durationSeconds?: bigint): RegistrationIntent;
    quoteRegistration(intent: RegistrationIntent): Promise<RegistrationIntent>;
    commit(intent: RegistrationIntent, signer: ContractRunner): Promise<any>;
    register(intent: RegistrationIntent, owner: string, signer: ContractRunner): Promise<any>;
    resolve(name: string): Promise<{
        node: string;
        owner: any;
        resolver: undefined;
        addresses: Record<number, string>;
        text: Record<string, string>;
        mailKeyHash?: undefined;
        mailKeyVersion?: undefined;
    } | {
        node: string;
        owner: any;
        resolver: any;
        addresses: {
            60?: undefined;
        } | {
            60: any;
        };
        mailKeyHash: any;
        mailKeyVersion: number;
        text?: undefined;
    }>;
    publishMailKey(name: string, keyHash: string, version: number, signer: ContractRunner): Promise<any>;
}

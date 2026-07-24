export type MailKeyPair = {
    publicKey: JsonWebKey;
    privateKey: JsonWebKey;
    algorithm: "ECDH-P256";
    version: number;
};
export type EncryptedPayload = {
    algorithm: "ECDH-P256/AES-256-GCM";
    version: number;
    ephemeralPublicKey: JsonWebKey;
    iv: string;
    ciphertext: string;
};
export type EncryptedVault = {
    algorithm: "PBKDF2-SHA256/AES-256-GCM";
    iterations: number;
    salt: string;
    iv: string;
    ciphertext: string;
};
export declare function generateMailboxKeyPair(version?: number): Promise<MailKeyPair>;
export declare function publicKeyHash(publicKey: JsonWebKey): Promise<string>;
export declare function encryptForRecipient(recipientPublicKey: JsonWebKey, plaintext: string, version?: number): Promise<EncryptedPayload>;
export declare function decryptForRecipient(recipientPrivateKey: JsonWebKey, payload: EncryptedPayload): Promise<string>;
export declare function encryptVault(value: unknown, password: string): Promise<EncryptedVault>;
export declare function decryptVault<T>(vault: EncryptedVault, password: string): Promise<T>;

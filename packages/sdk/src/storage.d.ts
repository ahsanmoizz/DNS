export interface CiphertextStorageAdapter {
    readonly id: string;
    put(path: string, ciphertext: Uint8Array, contentType?: string): Promise<string>;
    get(path: string): Promise<Uint8Array>;
}
export declare class GoogleDriveCiphertextStorage implements CiphertextStorageAdapter {
    private readonly accessToken;
    readonly id = "google-drive";
    constructor(accessToken: string);
    private headers;
    put(path: string, ciphertext: Uint8Array, contentType?: string): Promise<string>;
    get(path: string): Promise<Uint8Array<ArrayBuffer>>;
}
export declare class OneDriveApprovalRequired implements CiphertextStorageAdapter {
    readonly id = "onedrive";
    put(_path: string, _ciphertext: Uint8Array, _contentType?: string): Promise<string>;
    get(_path: string): Promise<Uint8Array>;
}

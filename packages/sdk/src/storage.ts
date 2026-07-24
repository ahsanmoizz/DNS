export interface CiphertextStorageAdapter { readonly id: string; put(path: string, ciphertext: Uint8Array, contentType?: string): Promise<string>; get(path: string): Promise<Uint8Array>; }
export class GoogleDriveCiphertextStorage implements CiphertextStorageAdapter {
  readonly id = "google-drive";
  constructor(private readonly accessToken: string) {}
  private headers() { return { Authorization: `Bearer ${this.accessToken}` }; }
  async put(path: string, ciphertext: Uint8Array, contentType = "application/octet-stream") { const metadata = new Blob([JSON.stringify({ name: path, mimeType: contentType })], { type: "application/json" }); const body = new FormData(); const bytes = ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength) as ArrayBuffer; body.append("metadata", metadata); body.append("file", new Blob([bytes], { type: contentType })); const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", { method: "POST", headers: this.headers(), body }); if (!response.ok) throw new Error("Google Drive ciphertext upload failed."); const file = await response.json() as { id: string }; return file.id; }
  async get(path: string) { const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(path)}?alt=media`, { headers: this.headers() }); if (!response.ok) throw new Error("Google Drive ciphertext download failed."); return new Uint8Array(await response.arrayBuffer()); }
}
/** Uses an application-issued presigned URL. It never receives plaintext or user keys. */
export class S3CompatibleCiphertextStorage implements CiphertextStorageAdapter {
  readonly id = "s3-compatible";
  constructor(private readonly issueUpload: (path: string, contentType: string) => Promise<{ url: string; reference: string }>, private readonly issueDownload: (reference: string) => Promise<string>) {}
  async put(path: string, ciphertext: Uint8Array, contentType = "application/octet-stream") { const target = await this.issueUpload(path, contentType); const response = await fetch(target.url, { method: "PUT", headers: { "content-type": contentType }, body: ciphertext }); if (!response.ok) throw new Error("S3-compatible ciphertext upload failed."); return target.reference; }
  async get(reference: string) { const response = await fetch(await this.issueDownload(reference)); if (!response.ok) throw new Error("S3-compatible ciphertext download failed."); return new Uint8Array(await response.arrayBuffer()); }
}
/** IPFS HTTP API adapter for ciphertext blobs. Gateway reads are content-addressed. */
export class IpfsCiphertextStorage implements CiphertextStorageAdapter {
  readonly id = "ipfs-compatible";
  constructor(private readonly apiBase: string, private readonly gatewayBase: string, private readonly headers: HeadersInit = {}) {}
  async put(path: string, ciphertext: Uint8Array, contentType = "application/octet-stream") { const form = new FormData(); const bytes = ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength) as ArrayBuffer; form.append("file", new Blob([bytes], { type: contentType }), path); const response = await fetch(`${this.apiBase.replace(/\/$/, "")}/api/v0/add?pin=true`, { method: "POST", headers: this.headers, body: form }); if (!response.ok) throw new Error("IPFS ciphertext upload failed."); const result = await response.json() as { Hash?: string }; if (!result.Hash) throw new Error("IPFS did not return a ciphertext CID."); return result.Hash; }
  async get(cid: string) { if (!/^[A-Za-z0-9]+$/.test(cid)) throw new Error("Invalid IPFS ciphertext CID."); const response = await fetch(`${this.gatewayBase.replace(/\/$/, "")}/ipfs/${cid}`, { headers: this.headers }); if (!response.ok) throw new Error("IPFS ciphertext download failed."); return new Uint8Array(await response.arrayBuffer()); }
}
export class OneDriveApprovalRequired implements CiphertextStorageAdapter { readonly id = "onedrive"; async put(_path: string, _ciphertext: Uint8Array, _contentType?: string): Promise<string> { throw new Error("OneDrive remains approval-gated for this Testnet release."); } async get(_path: string): Promise<Uint8Array> { throw new Error("OneDrive remains approval-gated for this Testnet release."); } }

export type CiphertextStorageSelection =
  | { provider: "google-drive"; accessToken: string }
  | { provider: "ipfs-compatible"; apiBase: string; gatewayBase: string; headers?: HeadersInit }
  | { provider: "s3-compatible"; issueUpload: (path: string, contentType: string) => Promise<{ url: string; reference: string }>; issueDownload: (reference: string) => Promise<string> }
  | { provider: "onedrive" };

/** Creates a ciphertext-only adapter selected by the user or environment. */
export function createCiphertextStorage(selection: CiphertextStorageSelection): CiphertextStorageAdapter {
  switch (selection.provider) {
    case "google-drive": return new GoogleDriveCiphertextStorage(selection.accessToken);
    case "ipfs-compatible": return new IpfsCiphertextStorage(selection.apiBase, selection.gatewayBase, selection.headers);
    case "s3-compatible": return new S3CompatibleCiphertextStorage(selection.issueUpload, selection.issueDownload);
    case "onedrive": return new OneDriveApprovalRequired();
  }
}

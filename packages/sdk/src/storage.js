export class GoogleDriveCiphertextStorage {
    accessToken;
    id = "google-drive";
    constructor(accessToken) {
        this.accessToken = accessToken;
    }
    headers() { return { Authorization: `Bearer ${this.accessToken}` }; }
    async put(path, ciphertext, contentType = "application/octet-stream") { const metadata = new Blob([JSON.stringify({ name: path, mimeType: contentType })], { type: "application/json" }); const body = new FormData(); const bytes = ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength); body.append("metadata", metadata); body.append("file", new Blob([bytes], { type: contentType })); const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", { method: "POST", headers: this.headers(), body }); if (!response.ok)
        throw new Error("Google Drive ciphertext upload failed."); const file = await response.json(); return file.id; }
    async get(path) { const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(path)}?alt=media`, { headers: this.headers() }); if (!response.ok)
        throw new Error("Google Drive ciphertext download failed."); return new Uint8Array(await response.arrayBuffer()); }
}
export class OneDriveApprovalRequired {
    id = "onedrive";
    async put(_path, _ciphertext, _contentType) { throw new Error("OneDrive remains approval-gated for this Testnet release."); }
    async get(_path) { throw new Error("OneDrive remains approval-gated for this Testnet release."); }
}

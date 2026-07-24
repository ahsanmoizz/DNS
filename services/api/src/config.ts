import dotenv from "dotenv";
import { resolve } from "node:path";
import type { DailyContractAddresses } from "@daily/sdk";

dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });

export type GoogleDriveConfig = { clientId: string; clientSecret: string; redirectUri: string };
export type ApiConfig = { port: number; databaseUrl: string; redisUrl: string; jwtSecret: string; allowedOrigins: string[]; evidenceRetentionDays: number; contractAddresses?: DailyContractAddresses; ccipGatewayPrivateKey?: string; googleDrive?: GoogleDriveConfig };

export function loadApiConfig(): ApiConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
  const ccipGatewayPrivateKey = process.env.CCIP_GATEWAY_PRIVATE_KEY;
  const deployed = [process.env.SEPOLIA_REGISTRY, process.env.SEPOLIA_RESOLVER, process.env.SEPOLIA_CAMPAIGN_ESCROW, process.env.SEPOLIA_REGISTRAR_DLY, process.env.SEPOLIA_REGISTRAR_DAY, process.env.SEPOLIA_REGISTRAR_DAILY];
  const originValues = [process.env.USER_APP_URL, process.env.ADMIN_APP_URL, process.env.AUTHENTICATED_PREVIEW_APP_URL].filter((value): value is string => Boolean(value));
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3000);
  const evidenceRetentionDays = Number(process.env.EVIDENCE_RETENTION_DAYS ?? 365);
  if (!databaseUrl) throw new Error("DATABASE_URL is required; Daily API does not use an in-memory production database.");
  if (!redisUrl) throw new Error("REDIS_URL is required for queue and rate-limit infrastructure.");
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === "development-only-replace-me") throw new Error("JWT_SECRET must be a unique secret with at least 32 characters.");
  if (!originValues.length) throw new Error("At least one public web origin is required for API CORS.");
  const allowedOrigins = originValues.map(value => { try { return new URL(value).origin; } catch { throw new Error("Configured web origins must be valid absolute URLs."); } });
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid TCP port.");
  if (!Number.isInteger(evidenceRetentionDays) || evidenceRetentionDays < 30 || evidenceRetentionDays > 3650) throw new Error("EVIDENCE_RETENTION_DAYS must be an integer from 30 to 3650.");
  if (ccipGatewayPrivateKey && !/^0x[0-9a-fA-F]{64}$/.test(ccipGatewayPrivateKey)) throw new Error("CCIP_GATEWAY_PRIVATE_KEY must be a 32-byte hex private key.");
  if (deployed.some(Boolean) && !deployed.every(Boolean)) throw new Error("All six SEPOLIA deployment address values must be configured together.");
  const googleValues = [googleClientId, googleClientSecret, googleRedirectUri];
  if (googleValues.some(Boolean) && !googleValues.every(Boolean)) throw new Error("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI must be configured together.");
  if (googleRedirectUri) { try { new URL(googleRedirectUri); } catch { throw new Error("GOOGLE_REDIRECT_URI must be a valid absolute URL."); } }
  const contractAddresses = deployed.every(Boolean) ? { registry: deployed[0]!, resolver: deployed[1]!, campaignEscrow: deployed[2]!, registrars: { dly: deployed[3]!, day: deployed[4]!, daily: deployed[5]! } } : undefined;
  return { port, databaseUrl, redisUrl, jwtSecret, allowedOrigins, evidenceRetentionDays, ...(contractAddresses ? { contractAddresses } : {}), ...(ccipGatewayPrivateKey ? { ccipGatewayPrivateKey } : {}), ...(googleClientId && googleClientSecret && googleRedirectUri ? { googleDrive: { clientId: googleClientId, clientSecret: googleClientSecret, redirectUri: googleRedirectUri } } : {}) };
}

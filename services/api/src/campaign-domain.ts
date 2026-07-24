import { createHash, randomBytes } from "node:crypto";

export type LocationTarget = { country: string; region?: string; city?: string };
export type MarketingConsent = { address: string; country: string; region?: string; city?: string; categories: readonly string[]; optedOut?: boolean };
export type GeographyRate = LocationTarget & { pricePerRecipientWei: bigint; active: boolean };
export type CampaignPolicy = { platformFeeBps: number; acknowledgementBps: number; clickBps: number; replyBps: number; refundDays: number; maxCampaignsPerDay: number };
export type CampaignDraft = { title: string; text: string; imageUrl?: string; clickableUrl: string; categories: readonly string[]; locations: readonly LocationTarget[]; recipientCount: number };
export type AudienceQuote = { eligibleAddresses: string[]; pricePerRecipientWei: bigint; rewardBudgetWei: bigint; platformFeeWei: bigint; totalDepositWei: bigint };

const address = /^0x[a-fA-F0-9]{40}$/;
const required = (value: string, field: string) => { const trimmed = value.trim(); if (!trimmed) throw new Error(`${field} is required.`); return trimmed; };

/** Opaque internal identity; never an SMTP address. */
export function createMarketingAlias(entropy = randomBytes(12).toString("hex")): string {
  const token = entropy.toLowerCase();
  if (!/^[a-z0-9]{24}$/.test(token)) throw new Error("Marketing alias entropy must be exactly 24 alphanumeric characters.");
  return `${token}.marketing.daily`;
}
export function stableMarketingAlias(walletAddress: string): string {
  if (!address.test(walletAddress)) throw new Error("A valid wallet address is required for a marketing identity.");
  return createMarketingAlias(createHash("sha256").update(walletAddress.toLowerCase()).digest("hex").slice(0, 24));
}
export function validateCampaignPolicy(policy: CampaignPolicy): CampaignPolicy {
  for (const [name, value] of Object.entries(policy)) if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative whole number.`);
  if (policy.platformFeeBps > 2_000) throw new Error("Platform fee cannot exceed the 20% contract cap.");
  if (policy.acknowledgementBps + policy.clickBps + policy.replyBps !== 10_000) throw new Error("Acknowledgement, click, and reply reward shares must total 100%.");
  if (policy.refundDays < 1 || policy.refundDays > 30) throw new Error("Refund deadline must be between 1 and 30 days.");
  if (policy.maxCampaignsPerDay < 1 || policy.maxCampaignsPerDay > 100) throw new Error("Campaign daily limit is outside the supported range.");
  return policy;
}
export function validateLocationTarget(target: LocationTarget): LocationTarget {
  required(target.country, "Country"); if (target.region !== undefined) required(target.region, "Region");
  if (target.city !== undefined && !target.region) throw new Error("A city target requires its state or region.");
  if (target.city !== undefined) required(target.city, "City"); return target;
}
export function validateCampaignDraft(draft: CampaignDraft): CampaignDraft {
  required(draft.title, "Campaign title"); required(draft.text, "Campaign message");
  if (new URL(required(draft.clickableUrl, "Clickable link")).protocol !== "https:") throw new Error("Campaign links must use HTTPS.");
  if (draft.imageUrl && new URL(draft.imageUrl).protocol !== "https:") throw new Error("Campaign image URLs must use HTTPS.");
  if (!Number.isSafeInteger(draft.recipientCount) || draft.recipientCount < 1) throw new Error("Recipient count must be at least one.");
  if (!draft.categories.length) throw new Error("Select at least one consent category."); if (!draft.locations.length) throw new Error("Select at least one country, region, or city.");
  draft.locations.forEach(validateLocationTarget); return draft;
}
function matchesLocation(consent: MarketingConsent, target: LocationTarget): boolean {
  return consent.country.localeCompare(target.country, undefined, { sensitivity: "accent" }) === 0
    && (!target.region || consent.region?.localeCompare(target.region, undefined, { sensitivity: "accent" }) === 0)
    && (!target.city || consent.city?.localeCompare(target.city, undefined, { sensitivity: "accent" }) === 0);
}
function matchesCategory(consent: MarketingConsent, categories: readonly string[]) { return categories.includes("ALL") || consent.categories.some(category => categories.includes(category)); }
/** Internal delivery selection only: marketers receive aggregate counts, not personal profiles. */
export function selectEligibleAudience(consents: readonly MarketingConsent[], draft: CampaignDraft): string[] {
  validateCampaignDraft(draft); const eligible = new Set<string>();
  for (const consent of consents) if (address.test(consent.address) && !consent.optedOut && matchesCategory(consent, draft.categories) && draft.locations.some(target => matchesLocation(consent, target))) eligible.add(consent.address.toLowerCase());
  return [...eligible].sort();
}
function rateSpecificity(rate: GeographyRate) { return Number(Boolean(rate.country)) + Number(Boolean(rate.region)) + Number(Boolean(rate.city)); }
export function findGeographyRate(target: LocationTarget, rates: readonly GeographyRate[]): GeographyRate {
  validateLocationTarget(target);
  const best = rates.filter(rate => rate.active && matchesLocation(target as MarketingConsent, rate)).sort((a, b) => rateSpecificity(b) - rateSpecificity(a))[0];
  if (!best) throw new Error(`No active geography rate is configured for ${target.country}.`); return best;
}
export function quoteAudience(draft: CampaignDraft, consents: readonly MarketingConsent[], rates: readonly GeographyRate[], policy: CampaignPolicy): AudienceQuote {
  validateCampaignDraft(draft); validateCampaignPolicy(policy); const eligibleAddresses = selectEligibleAudience(consents, draft);
  if (eligibleAddresses.length < draft.recipientCount) throw new Error("Requested recipients exceed the aggregate opted-in audience.");
  const selected = eligibleAddresses.slice(0, draft.recipientCount);
  const pricePerRecipientWei = draft.locations.reduce((sum, target) => sum + findGeographyRate(target, rates).pricePerRecipientWei, 0n) / BigInt(draft.locations.length);
  if (pricePerRecipientWei <= 0n) throw new Error("Geography price must be greater than zero.");
  const rewardBudgetWei = pricePerRecipientWei * BigInt(selected.length); const platformFeeWei = rewardBudgetWei * BigInt(policy.platformFeeBps) / 10_000n;
  return { eligibleAddresses: selected, pricePerRecipientWei, rewardBudgetWei, platformFeeWei, totalDepositWei: rewardBudgetWei + platformFeeWei };
}
/** Supports quoted CSV cells. Local-area/postcode columns are intentionally rejected. */
export function parseGeographyCsv(csv: string): GeographyRate[] {
  const rows = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean).map(parseCsvLine); if (!rows.length) throw new Error("Geography CSV is empty.");
  const header = rows.shift()!.map(value => value.trim().toLowerCase()); const expected = ["country", "region", "city", "price_per_recipient_wei"];
  if (header.join(",") !== expected.join(",")) throw new Error("Geography CSV header must be country,region,city,price_per_recipient_wei.");
  return rows.map((row, index) => { if (row.length !== header.length) throw new Error(`Geography CSV row ${index + 2} has an invalid column count.`); const [country, region, city, rawPrice] = row.map(value => value.trim());
    if (!/^\d+$/.test(rawPrice) || BigInt(rawPrice) <= 0n) throw new Error(`Geography CSV row ${index + 2} has an invalid price.`); const value = { country, ...(region ? { region } : {}), ...(city ? { city } : {}), pricePerRecipientWei: BigInt(rawPrice), active: true }; validateLocationTarget(value); return value; });
}
function parseCsvLine(line: string): string[] { const values: string[] = []; let value = ""; let quoted = false; for (let i = 0; i < line.length; i += 1) { const char = line[i]; if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i += 1; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { values.push(value); value = ""; } else value += char; } if (quoted) throw new Error("Geography CSV has an unmatched quote."); values.push(value); return values; }

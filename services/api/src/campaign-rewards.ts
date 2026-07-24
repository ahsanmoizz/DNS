import { AbiCoder, getAddress, keccak256 } from "ethers";

export type RewardAllocationInput = { recipient: string; amountWei: string };
export type RewardDistribution = { root: string; allocations: Array<{ index: number; recipient: string; amountWei: string; proof: string[] }> };
const coder = AbiCoder.defaultAbiCoder();
const pair = (a: string, b: string) => keccak256(`0x${[a, b].sort().map(x => x.slice(2)).join("")}`);
const leaf = (index: number, recipient: string, amountWei: string) => keccak256(keccak256(coder.encode(["uint256", "address", "uint256"], [index, getAddress(recipient), BigInt(amountWei)])));
export function buildRewardDistribution(input: readonly RewardAllocationInput[]): RewardDistribution {
  if (!input.length || input.length > 1_000_000) throw new Error("A reward distribution requires 1 to 1,000,000 allocations.");
  const seen = new Set<string>(); const allocations = input.map((item, index) => { if (!/^\d+$/.test(item.amountWei) || BigInt(item.amountWei) <= 0n) throw new Error("Reward amounts must be positive wei."); const recipient = getAddress(item.recipient); if (seen.has(recipient.toLowerCase())) throw new Error("Reward recipients must be unique."); seen.add(recipient.toLowerCase()); return { index, recipient, amountWei: item.amountWei, proof: [] as string[], hash: leaf(index, recipient, item.amountWei) }; });
  let hashes = allocations.map(item => item.hash); let positions = allocations.map((_, index) => index);
  while (hashes.length > 1) { for (let i = 0; i < allocations.length; i++) { const sibling = positions[i] ^ 1; if (sibling < hashes.length) allocations[i].proof.push(hashes[sibling]); } const next: string[] = []; for (let i = 0; i < hashes.length; i += 2) next.push(i + 1 < hashes.length ? pair(hashes[i], hashes[i + 1]) : hashes[i]); positions = positions.map(position => Math.floor(position / 2)); hashes = next; }
  return { root: hashes[0], allocations: allocations.map(({ hash: _hash, ...allocation }) => allocation) };
}

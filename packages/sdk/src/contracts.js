import { Contract, JsonRpcProvider, concat, hexlify, keccak256, randomBytes, solidityPackedKeccak256, toUtf8Bytes } from "ethers";
import { normalizeLabel, normalizeName } from "./index.js";
import { SEPOLIA_CONTRACTS } from "./sepolia.js";
const REGISTRAR_ABI = ["function commit(bytes32 commitment)", "function register(string label,address owner,uint64 duration,bytes32 secret) payable", "function price(uint256 length,uint64 duration) view returns (uint256)", "function expiries(bytes32 node) view returns (uint64)", "function catalog(bytes32 labelhash) view returns (uint8)"];
const REGISTRY_ABI = ["function owner(bytes32 node) view returns (address)", "function resolver(bytes32 node) view returns (address)", "function setResolver(bytes32 node,address resolver)"];
const RESOLVER_ABI = ["function addr(bytes32 node,uint256 coinType) view returns (bytes)", "function text(bytes32 node,string key) view returns (string)", "function mailKeyHash(bytes32 node) view returns (bytes32)", "function mailKeyVersion(bytes32 node) view returns (uint32)", "function setMailKey(bytes32 node,bytes32 hash,uint32 version)"];
export class DailyContracts {
    provider;
    constructor(provider = new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com")) { this.provider = provider; }
    registrar(tld, runner = this.provider) { return new Contract(SEPOLIA_CONTRACTS.registrars[tld], REGISTRAR_ABI, runner); }
    async search(labelInput, durationSeconds = 365n * 24n * 60n * 60n) {
        const label = normalizeLabel(labelInput);
        const now = Math.floor(Date.now() / 1000);
        return Promise.all(["dly", "day", "daily"].map(async (tld) => {
            const name = normalizeName(`${label}.${tld}`);
            const node = namehashUnchecked(name);
            const registrar = this.registrar(tld);
            const [category, expiry, price] = await Promise.all([registrar.catalog(keccak256(toUtf8Bytes(label))), registrar.expiries(node), registrar.price(new TextEncoder().encode(label).length, durationSeconds)]);
            const status = category === 1n ? "premium" : category === 2n ? "reserved" : category === 3n ? "official" : Number(expiry) > now ? "owned" : "available";
            return { name, tld, node, status, priceWei: BigInt(price), expiresAt: Number(expiry) || undefined };
        }));
    }
    createRegistration(labelInput, tld, owner, durationSeconds = 365n * 24n * 60n * 60n) {
        const label = normalizeLabel(labelInput);
        const secret = hexlify(randomBytes(32));
        const commitment = solidityPackedKeccak256(["bytes32", "address", "uint64", "bytes32"], [keccak256(toUtf8Bytes(label)), owner, durationSeconds, secret]);
        return { label, tld, durationSeconds, secret, commitment, priceWei: 0n };
    }
    async quoteRegistration(intent) { return { ...intent, priceWei: BigInt(await this.registrar(intent.tld).price(new TextEncoder().encode(intent.label).length, intent.durationSeconds)) }; }
    async commit(intent, signer) { return this.registrar(intent.tld, signer).commit(intent.commitment); }
    async register(intent, owner, signer) { return this.registrar(intent.tld, signer).register(intent.label, owner, intent.durationSeconds, intent.secret, { value: intent.priceWei }); }
    async resolve(name) {
        const node = namehashUnchecked(normalizeName(name));
        const registry = new Contract(SEPOLIA_CONTRACTS.registry, REGISTRY_ABI, this.provider);
        const [owner, resolverAddress] = await Promise.all([registry.owner(node), registry.resolver(node)]);
        if (resolverAddress === "0x0000000000000000000000000000000000000000")
            return { node, owner, resolver: undefined, addresses: {}, text: {} };
        const resolver = new Contract(resolverAddress, RESOLVER_ABI, this.provider);
        const eth = await resolver.addr(node, 60);
        return { node, owner, resolver: resolverAddress, addresses: eth === "0x" ? {} : { 60: eth }, mailKeyHash: await resolver.mailKeyHash(node), mailKeyVersion: Number(await resolver.mailKeyVersion(node)) };
    }
    async publishMailKey(name, keyHash, version, signer) { const node = namehashUnchecked(normalizeName(name)); const registry = new Contract(SEPOLIA_CONTRACTS.registry, REGISTRY_ABI, signer); const current = await registry.resolver(node); if (current.toLowerCase() !== SEPOLIA_CONTRACTS.resolver.toLowerCase())
        await (await registry.setResolver(node, SEPOLIA_CONTRACTS.resolver)).wait(); return new Contract(SEPOLIA_CONTRACTS.resolver, RESOLVER_ABI, signer).setMailKey(node, keyHash, version); }
}
function namehashUnchecked(name) { let node = "0x" + "00".repeat(32); for (const label of name.split(".").reverse())
    node = keccak256(concat([node, keccak256(toUtf8Bytes(label))])); return node; }

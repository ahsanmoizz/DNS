# Sepolia deployment

1. Install dependencies with `pnpm install` at the workspace root. The Sepolia deployer uses the locally configured Ethers signer; no Truffle signing-provider installation is required.
2. Copy `.env.example` to `.env`; set `DEPLOYER_PRIVATE_KEY` locally. Never share or commit it.
3. Fund the deployer with Sepolia ETH on chain `11155111`.
4. Run `pnpm --filter @daily/contracts migrate:sepolia`.
5. The script writes both `packages/contracts/deployments/sepolia.json` and `packages/contracts/deployments/sepolia.generated.env`. Copy the non-secret generated address variables into the API and web build environment, then rebuild/restart those services. The SDK reads these runtime values; no source-address edit is required.
6. Verify its deployed bytecode with `pnpm --filter @daily/contracts verify:sepolia`. Send only the address manifest back for release configuration.

The migration rejects any network other than Sepolia; Daily Testnet and mainnet deployment remain deliberately unavailable.

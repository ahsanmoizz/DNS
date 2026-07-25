#!/bin/bash
# Mainnet Deployment Scaffolding (DLY-118)
echo "Preparing Mainnet deployment for Daily DNS..."

# Ensure environment variables are loaded
if [ -f .env ]; then
  echo "Loading .env file..."
  set -a; source .env; set +a
else
  echo "Error: .env file not found."
  exit 1
fi

if [ -z "$MAINNET_RPC_URL" ] || [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
  echo "Error: Missing MAINNET_RPC_URL or DEPLOYER_PRIVATE_KEY"
  exit 1
fi

echo "Deploying Registry..."
npx hardhat run scripts/deploy-registry.ts --network mainnet

echo "Deploying Resolvers..."
npx hardhat run scripts/deploy-resolver.ts --network mainnet

echo "Deploying TLD Registrars (.dly, .day, .daily)..."
npx hardhat run scripts/deploy-registrars.ts --network mainnet

echo "Mainnet deployment complete."

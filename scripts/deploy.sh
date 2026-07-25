#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 user@host:/target/directory"
  exit 1
fi

TARGET=$1

echo "Creating deploy tarball (deploy.tar.gz)..."
tar -czf deploy.tar.gz \
  apps/user-web/dist \
  apps/admin-web/dist \
  services/api \
  services/indexer \
  services/mail-relay \
  packages \
  deploy \
  scripts \
  package.json \
  pnpm-workspace.yaml \
  pnpm-lock.yaml \
  ecosystem.config.cjs \
  .env

echo "Uploading deploy.tar.gz to $TARGET..."
scp deploy.tar.gz "$TARGET"

echo "Cleaning up local tarball..."
rm deploy.tar.gz

echo "Deploy complete. Connect to server, extract tarball, and run scripts/setup.sh"

#!/bin/bash
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building all packages..."
pnpm build

echo "Build complete."

#!/bin/bash
set -e

echo "=== Daily Identity Production Setup ==="

# 1. Load environment variables
if [ -f .env ]; then
  echo "Loading .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found."
  exit 1
fi

# 2. Database Setup (Port 5480)
echo "Ensuring database exists on offset port 5480..."
# Extract user, password, dbname from DATABASE_URL if needed, but assuming default "daily:daily" for setup script matching the .env
psql -p 5480 -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'daily_identity'" | grep -q 1 || psql -p 5480 -U postgres -c "CREATE DATABASE daily_identity"
psql -p 5480 -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = 'daily'" | grep -q 1 || psql -p 5480 -U postgres -c "CREATE USER daily WITH ENCRYPTED PASSWORD 'daily'"
psql -p 5480 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE daily_identity TO daily"

# 3. Nginx Configuration
echo "Configuring Nginx..."
# Assuming script runs from deployment root directory
DEPLOY_DIR=$(pwd)

# Replace the Docker paths in the Nginx config with actual server paths
sed "s|/usr/share/nginx/html|${DEPLOY_DIR}/apps/user-web/dist|g" deploy/nginx-user.conf > /etc/nginx/sites-available/daily-user.conf
sed "s|/usr/share/nginx/html|${DEPLOY_DIR}/apps/admin-web/dist|g" deploy/nginx-admin.conf > /etc/nginx/sites-available/daily-admin.conf

ln -sf /etc/nginx/sites-available/daily-user.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/daily-admin.conf /etc/nginx/sites-enabled/

nginx -t
systemctl reload nginx

# 4. Dependency Installation
echo "Installing Node dependencies (native rebuild)..."
pnpm install --frozen-lockfile

# 5. Database Migrations
echo "Running database migrations..."
pnpm --filter @daily/api tsx src/migrate.ts

# 6. PM2 Process Manager
echo "Starting PM2 processes..."
pm2 start ecosystem.config.cjs
pm2 save

echo "=== Setup Complete ==="

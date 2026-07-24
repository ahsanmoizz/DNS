# Remote browser deployment

This product must run on a persistent remote host; Cloudflare quick-tunnel addresses only proxy a process already running elsewhere and cannot host PostgreSQL or Redis.

## Required remote environment

- A Linux VM or a container platform with persistent disk capacity for PostgreSQL and Redis.
- Docker Engine with Compose v2, or equivalent managed PostgreSQL and Redis services.
- Four persistent HTTPS hostnames: user web, admin web, API, and authenticated preview.
- Remote-only secrets: `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, Google OAuth credentials, and the Sepolia RPC URL. Do not copy the deployer private key into an application container.

## Self-hosted deployment

1. Transfer the repository to the remote host and create a remote `.env` with the variables above.
2. Set Google OAuth's redirect URI to the final API HTTPS callback, not a Cloudflare quick-tunnel address.
3. Run `docker compose -f docker-compose.production.yml up -d --build` on the remote host.
4. Place a TLS reverse proxy in front of ports `8080` (user), `8081` (admin), and `3000` (API). The preview route must enforce wallet-session authentication at the proxy or API layer.
5. Verify `/health`, run the Sepolia deployment verifier, then open the persistent user and admin HTTPS URLs in a browser.

The compose file starts schema migration before the API and indexer. It deliberately does not deploy contracts or expose PostgreSQL/Redis publicly.

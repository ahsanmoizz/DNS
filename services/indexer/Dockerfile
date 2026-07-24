FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @daily/indexer build
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@daily/indexer", "run:sepolia"]

# The API uses tsx at runtime so workspace SDK source remains single-sourced.
FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @daily/sdk build && pnpm --filter @daily/api build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@daily/api", "start"]

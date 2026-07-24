# Build with repository root as the Docker context.
FROM node:22-alpine AS build
WORKDIR /workspace
ARG API_URL
ENV API_URL=$API_URL
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @daily/user-web build

FROM nginx:1.27-alpine
COPY deploy/nginx-user.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/user-web/dist /usr/share/nginx/html
EXPOSE 8080

module.exports = {
  apps: [
    {
      name: "daily-api",
      script: "pnpm",
      args: "--filter @daily/api start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "daily-indexer",
      script: "pnpm",
      args: "--filter @daily/indexer start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "daily-mail-relay",
      script: "pnpm",
      args: "--filter @daily/mail-relay start",
      env: {
        NODE_ENV: "production",
      },
    }
  ],
};

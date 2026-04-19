import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

const server = app.listen(env.port, () => {
  console.log(`Laxmi Oils API listening on http://localhost:${env.port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Closing API server.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

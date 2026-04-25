import { prisma } from "./prisma/client.js";

async function deleteAllProducts() {
  console.log("Deleting all products...");
  const result = await prisma.product.deleteMany({});
  console.log(`Deleted ${result.count} products`);
  await prisma.$disconnect();
}

deleteAllProducts().catch((error) => {
  console.error(error);
  process.exit(1);
});

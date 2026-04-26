import { prisma } from "./prisma/client.js";

export async function clearAllProducts() {
  try {
    console.log("Connecting to database...");
    
    // Test connection first
    await prisma.$connect();
    console.log("Database connected successfully!");
    
    console.log("Clearing all products from database...");
    
    // Count products before deletion
    const countBefore = await prisma.product.count();
    console.log(`Found ${countBefore} products to delete`);
    
    // Delete all products
    const deleteResult = await prisma.product.deleteMany({});
    
    console.log(`Successfully deleted ${deleteResult.count} products`);
    console.log("All seed products have been removed.");
    console.log("Only manually added products from admin panel will remain.");
    
    // Verify deletion
    const countAfter = await prisma.product.count();
    console.log(`Products remaining: ${countAfter}`);
    
  } catch (error) {
    console.error("Error clearing products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAllProducts()
    .then(() => {
      console.log("Products cleared successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to clear products:", error);
      process.exit(1);
    });
}

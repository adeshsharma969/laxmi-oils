const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// List of seeded product IDs from the old seed.js file
const SEEDED_PRODUCT_IDS = [
  // Mustard Oil
  'mustard-500ml',
  'mustard-1l', 
  'mustard-5l',
  'mustard-15l',
  
  // Soyabean Oil
  'soyabean-500ml',
  'soyabean-1l',
  'soyabean-5l', 
  'soyabean-15l',
  
  // Groundnut Oil
  'groundnut-500ml',
  'groundnut-1l',
  'groundnut-5l',
  'groundnut-15l',
  
  // Sunflower Oil
  'sunflower-500ml',
  'sunflower-1l',
  'sunflower-5l',
  'sunflower-15l'
];

async function removeSeededProducts() {
  try {
    console.log("Connecting to database...");
    
    await prisma.$connect();
    console.log("Database connected successfully!");
    
    console.log("Checking for seeded products to remove...");
    
    // Count total products before deletion
    const totalProducts = await prisma.product.count();
    console.log(`Total products in database: ${totalProducts}`);
    
    // Find seeded products
    const seededProducts = await prisma.product.findMany({
      where: {
        productId: {
          in: SEEDED_PRODUCT_IDS
        }
      },
      select: {
        productId: true,
        name: true,
        category: true
      }
    });
    
    console.log(`Found ${seededProducts.length} seeded products to remove:`);
    seededProducts.forEach(p => {
      console.log(`  - ${p.name} (${p.productId})`);
    });
    
    if (seededProducts.length === 0) {
      console.log("No seeded products found. All products appear to be manually added.");
      return;
    }
    
    // Delete only the seeded products
    const deleteResult = await prisma.product.deleteMany({
      where: {
        productId: {
          in: SEEDED_PRODUCT_IDS
        }
      }
    });
    
    console.log(`\nSuccessfully deleted ${deleteResult.count} seeded products!`);
    
    // Count remaining products
    const remainingProducts = await prisma.product.count();
    console.log(`Remaining products (your manually added ones): ${remainingProducts}`);
    
    // Show remaining products for verification
    const remaining = await prisma.product.findMany({
      select: {
        productId: true,
        name: true,
        category: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log("\nYour manually added products:");
    remaining.forEach(p => {
      console.log(`  - ${p.name} (${p.productId}) - ${p.category}`);
    });
    
    console.log("\n✅ Only seeded products have been removed!");
    console.log("✅ Your manually added products are preserved!");
    
  } catch (error) {
    console.error("Error removing seeded products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

removeSeededProducts()
  .then(() => {
    console.log("Seeded products removal completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to remove seeded products:", error);
    process.exit(1);
  });

import bcrypt from "bcryptjs";
import { prisma } from "./prisma/client.js";
import { makeReferralCode, prefixedId } from "./utils/ids.js";
import { nowIso } from "./utils/time.js";

const TEST_USERS = [
  {
    email: "testuser@laxmioils.com",
    password: "test123456",
    name: "Test User",
    phone: "9876543210"
  },
  {
    email: "customer@laxmioils.com", 
    password: "customer123",
    name: "Sample Customer",
    phone: "9123456789"
  },
  {
    email: "demo@laxmioils.com",
    password: "demo123", 
    name: "Demo User",
    phone: "9988776655"
  }
];

export async function seedTestUsers() {
  try {
    const now = nowIso();
    
    console.log("🌱 Seeding test users...");
    
    for (const user of TEST_USERS) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ 
        where: { email: user.email } 
      });
      
      const passwordHash = await bcrypt.hash(user.password, 12);
      
      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { email: user.email },
          data: {
            passwordHash,
            name: user.name,
            phone: user.phone,
            role: "user",
            updatedAt: now
          }
        });
        console.log(`✅ Updated user: ${user.email}`);
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            userId: prefixedId("user"),
            email: user.email,
            passwordHash,
            name: user.name,
            phone: user.phone,
            role: "user",
            provider: "password",
            referralCode: makeReferralCode(user.name),
            rewardsEarned: 0,
            createdAt: now,
            updatedAt: now,
          }
        });
        console.log(`✅ Created user: ${user.email}`);
      }
    }
    
    console.log("\n🎉 Test users seeded successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    TEST_USERS.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Phone: ${user.phone}`);
    });
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error) {
    console.error("❌ Error seeding test users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestUsers()
    .then(() => {
      console.log("\n✅ Test user seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to seed test users:", error);
      process.exit(1);
    });
}

import bcrypt from "bcryptjs";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";
import { makeReferralCode, prefixedId } from "./utils/ids.js";
import { nowIso } from "./utils/time.js";

const categories = [
  { slug: "mustard", name: "Mustard", description: "Kachi ghani and family packs" },
  { slug: "soyabean", name: "Soyabean", description: "Everyday refined oils" },
  { slug: "groundnut", name: "Groundnut", description: "Filtered nutty oils" },
  { slug: "sunflower", name: "Sunflower", description: "Light healthy oils" },
];

// Products are now added via admin panel only - no seeding

export async function seed() {
  const now = nowIso();

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: { categoryId: prefixedId("cat", 5), ...category, createdAt: now, updatedAt: now },
      update: { ...category, updatedAt: now },
    });
  }

  // Product seeding removed - products should be added via admin panel

  const existingAdmin = await prisma.user.findUnique({ where: { email: env.adminEmail } });
  const passwordHash = await bcrypt.hash(env.adminPassword, 12);

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: env.adminEmail },
      data: { passwordHash, role: "admin", updatedAt: now },
    });
  } else {
    await prisma.user.create({
      data: {
        userId: prefixedId("user"),
        email: env.adminEmail,
        passwordHash,
        name: "Laxmi Admin",
        role: "admin",
        provider: "password",
        referralCode: makeReferralCode("Laxmi Admin"),
        rewardsEarned: 0,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
  console.log("Seed complete!");
}

// Run seed if called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

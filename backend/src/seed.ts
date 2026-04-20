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

const products = [
  // 🟡 MUSTARD OIL - 4 Products (one per size)
  { productId: "mustard-500ml", name: "Laxmi Mustard Oil - 500ml Bottle", category: "mustard", sizes: [{ label: "500 ml", price: 95 }], rating: 4.9, reviews: 2184, badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80", description: "Wood cold-pressed from hand-picked Rajasthani mustard seeds. Pungent, sharp, fiery — the way Dadi used to cook.", benefits: ["Cold Pressed", "Unrefined", "High in Omega-3", "No Additives"], nutrition: { energy: "900 kcal", fat: "100g", sat: "9g", trans: "0g" }, bg: "#D98F00" },
  { productId: "mustard-1l", name: "Laxmi Mustard Oil - 1L Bottle/Pouch", category: "mustard", sizes: [{ label: "1 L", price: 185 }], rating: 4.9, reviews: 1856, badge: "POPULAR", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80", description: "Wood cold-pressed from hand-picked Rajasthani mustard seeds. Pungent, sharp, fiery — the way Dadi used to cook.", benefits: ["Cold Pressed", "Unrefined", "High in Omega-3", "No Additives"], nutrition: { energy: "900 kcal", fat: "100g", sat: "9g", trans: "0g" }, bg: "#D98F00" },
  { productId: "mustard-5l", name: "Laxmi Mustard Oil - 5L Jar", category: "mustard", sizes: [{ label: "5 L", price: 875 }], rating: 4.9, reviews: 1423, badge: "FAMILY", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80", description: "Wood cold-pressed from hand-picked Rajasthani mustard seeds. The monthly ration your family deserves.", benefits: ["Cold Pressed", "Unrefined", "High in Omega-3", "Bulk Value"], nutrition: { energy: "900 kcal", fat: "100g", sat: "9g", trans: "0g" }, bg: "#D98F00" },
  { productId: "mustard-15l", name: "Laxmi Mustard Oil - 15L Tin", category: "mustard", sizes: [{ label: "15 L", price: 2595 }], rating: 4.9, reviews: 892, badge: "COMMERCIAL", image: "https://images.unsplash.com/photo-1632054010678-7f2e5a1a7355?w=800&q=80", description: "Wood cold-pressed mustard oil in commercial tin packaging. Perfect for restaurants and bulk users.", benefits: ["Cold Pressed", "Commercial Pack", "Best Value", "Authentic"], nutrition: { energy: "900 kcal", fat: "100g", sat: "9g", trans: "0g" }, bg: "#D98F00" },

  // 🟢 SOYABEAN OIL - 4 Products (one per size)
  { productId: "soyabean-500ml", name: "Laxmi Soyabean Oil - 500ml Bottle", category: "soyabean", sizes: [{ label: "500 ml", price: 78 }], rating: 4.7, reviews: 1567, badge: "LIGHT", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80", description: "Six-stage refined MP soyabean oil. Light, neutral and heart-friendly — your everyday warrior.", benefits: ["6x Refined", "Heart Light", "Vit A+D Fortified", "Neutral Flavour"], nutrition: { energy: "884 kcal", fat: "100g", sat: "16g", trans: "0g" }, bg: "#4A7C59" },
  { productId: "soyabean-1l", name: "Laxmi Soyabean Oil - 1L Bottle/Pouch", category: "soyabean", sizes: [{ label: "1 L", price: 145 }], rating: 4.7, reviews: 1234, badge: "DAILY USE", image: "https://images.unsplash.com/photo-1599527176168-59f94c37eb30?w=800&q=80", description: "Six-stage refined MP soyabean oil. Light, neutral and heart-friendly — your everyday warrior.", benefits: ["6x Refined", "Heart Light", "Vit A+D Fortified", "Neutral Flavour"], nutrition: { energy: "884 kcal", fat: "100g", sat: "16g", trans: "0g" }, bg: "#4A7C59" },
  { productId: "soyabean-5l", name: "Laxmi Soyabean Oil - 5L Jar", category: "soyabean", sizes: [{ label: "5 L", price: 695 }], rating: 4.7, reviews: 987, badge: "FAMILY", image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80", description: "Light on the stomach, heavy on value. 5L of everyday goodness for your family.", benefits: ["Family Size", "Vit A+D", "Refined", "Affordable"], nutrition: { energy: "884 kcal", fat: "100g", sat: "16g", trans: "0g" }, bg: "#4A7C59" },
  { productId: "soyabean-15l", name: "Laxmi Soyabean Oil - 15L Tin", category: "soyabean", sizes: [{ label: "15 L", price: 2045 }], rating: 4.7, reviews: 654, badge: "VALUE", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80", description: "Light, healthy soyabean oil in commercial tin. Best value for restaurants and bulk cooking.", benefits: ["Commercial Size", "Vit A+D", "Refined", "Best Value"], nutrition: { energy: "884 kcal", fat: "100g", sat: "16g", trans: "0g" }, bg: "#4A7C59" },

  // 🟤 GROUNDNUT OIL - 4 Products (one per size)
  { productId: "groundnut-500ml", name: "Laxmi Groundnut Oil - 500ml Bottle", category: "groundnut", sizes: [{ label: "500 ml", price: 140 }], rating: 4.8, reviews: 1876, badge: "PURE", image: "https://images.unsplash.com/photo-1596450531384-344b3a29019c?w=800&q=80", description: "Kolhu-filtered single origin Saurashtra groundnuts. Deep nutty aroma, perfect for deep frying.", benefits: ["Single Origin", "High Smoke Point", "Rich in Vit E", "Zero Cholesterol"], nutrition: { energy: "884 kcal", fat: "100g", sat: "17g", trans: "0g" }, bg: "#B8431A" },
  { productId: "groundnut-1l", name: "Laxmi Groundnut Oil - 1L Bottle/Pouch", category: "groundnut", sizes: [{ label: "1 L", price: 265 }], rating: 4.8, reviews: 1542, badge: "FILTERED", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80", description: "Kolhu-filtered single origin Saurashtra groundnuts. Deep nutty aroma, perfect for deep frying.", benefits: ["Single Origin", "High Smoke Point", "Rich in Vit E", "Zero Cholesterol"], nutrition: { energy: "884 kcal", fat: "100g", sat: "17g", trans: "0g" }, bg: "#B8431A" },
  { productId: "groundnut-5l", name: "Laxmi Groundnut Oil - 5L Jar", category: "groundnut", sizes: [{ label: "5 L", price: 1275 }], rating: 4.8, reviews: 1123, badge: "FAMILY", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80", description: "The authentic jar pack — built for the halwai, loved by the home cook.", benefits: ["Cold Filtered", "High Smoke Point", "Bulk Value", "Kolhu Pressed"], nutrition: { energy: "884 kcal", fat: "100g", sat: "17g", trans: "0g" }, bg: "#B8431A" },
  { productId: "groundnut-15l", name: "Laxmi Groundnut Oil - 15L Tin", category: "groundnut", sizes: [{ label: "15 L", price: 3745 }], rating: 4.8, reviews: 876, badge: "TIN PACK", image: "https://images.unsplash.com/photo-1632054010678-7f2e5a1a7355?w=800&q=80", description: "The authentic tin pack — built for the halwai, loved by the home cook.", benefits: ["Traditional Tin", "Cold Filtered", "Bulk Value", "Kolhu Pressed"], nutrition: { energy: "884 kcal", fat: "100g", sat: "17g", trans: "0g" }, bg: "#B8431A" },

  // 🌻 SUNFLOWER OIL - 4 Products (one per size)
  { productId: "sunflower-500ml", name: "Laxmi Sunflower Oil - 500ml Bottle", category: "sunflower", sizes: [{ label: "500 ml", price: 82 }], rating: 4.8, reviews: 1456, badge: "HEALTHY", image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80", description: "Light, healthy sunflower oil with natural vitamin E. Perfect for everyday cooking with a neutral taste.", benefits: ["Rich in Vit E", "Light & Healthy", "Low Saturated Fat", "Cholesterol Free"], nutrition: { energy: "884 kcal", fat: "100g", sat: "11g", trans: "0g" }, bg: "#F4B942" },
  { productId: "sunflower-1l", name: "Laxmi Sunflower Oil - 1L Bottle/Pouch", category: "sunflower", sizes: [{ label: "1 L", price: 155 }], rating: 4.8, reviews: 1234, badge: "DAILY COOK", image: "https://images.unsplash.com/photo-1599527176168-59f94c37eb30?w=800&q=80", description: "Light, healthy sunflower oil with natural vitamin E. Perfect for everyday cooking with a neutral taste.", benefits: ["Rich in Vit E", "Light & Healthy", "Low Saturated Fat", "Cholesterol Free"], nutrition: { energy: "884 kcal", fat: "100g", sat: "11g", trans: "0g" }, bg: "#F4B942" },
  { productId: "sunflower-5l", name: "Laxmi Sunflower Oil - 5L Jar", category: "sunflower", sizes: [{ label: "5 L", price: 745 }], rating: 4.8, reviews: 987, badge: "FAMILY", image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80", description: "Light, healthy sunflower oil in family jar. Perfect for daily cooking needs.", benefits: ["Rich in Vit E", "Family Pack", "Low Saturated Fat", "Cholesterol Free"], nutrition: { energy: "884 kcal", fat: "100g", sat: "11g", trans: "0g" }, bg: "#F4B942" },
  { productId: "sunflower-15l", name: "Laxmi Sunflower Oil - 15L Tin", category: "sunflower", sizes: [{ label: "15 L", price: 2195 }], rating: 4.8, reviews: 654, badge: "BULK", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80", description: "Light, healthy sunflower oil in commercial tin. Best value for bulk cooking.", benefits: ["Rich in Vit E", "Commercial Pack", "Low Saturated Fat", "Best Value"], nutrition: { energy: "884 kcal", fat: "100g", sat: "11g", trans: "0g" }, bg: "#F4B942" },
];

export async function seed() {
  const now = nowIso();

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: { categoryId: prefixedId("cat", 5), ...category, createdAt: now, updatedAt: now },
      update: { ...category, updatedAt: now },
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { productId: product.productId },
      create: { ...product, inventory: 100, active: true, createdAt: now, updatedAt: now },
      update: { ...product, inventory: 100, active: true, updatedAt: now },
    });
    console.log(`Seeded: ${product.name}`);
  }

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

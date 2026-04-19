import bcrypt from "bcryptjs";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";
import { makeReferralCode, prefixedId } from "./utils/ids.js";
import { nowIso } from "./utils/time.js";

const categories = [
  { slug: "mustard", name: "Mustard", description: "Kachi ghani and family packs" },
  { slug: "soyabean", name: "Soyabean", description: "Everyday refined oils" },
  { slug: "groundnut", name: "Groundnut", description: "Filtered nutty oils" },
];

const products = [
  {
    productId: "m1l",
    name: "Kachi Ghani Mustard Oil",
    category: "mustard",
    sizes: [{ label: "500ml", price: 159 }, { label: "1L", price: 289 }, { label: "5L", price: 1399 }],
    rating: 4.9,
    reviews: 2184,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    description: "Wood cold-pressed from hand-picked Rajasthani mustard seeds. Pungent, sharp, fiery - the way Dadi used to cook.",
    benefits: ["Cold Pressed", "Unrefined", "High in Omega-3", "No Additives"],
    nutrition: { energy: "900 kcal", fat: "100g", sat: "9g", trans: "0g" },
    bg: "#D98F00",
  },
  {
    productId: "g1l",
    name: "Filtered Groundnut Oil",
    category: "groundnut",
    sizes: [{ label: "1L", price: 249 }, { label: "5L", price: 1199 }, { label: "15L", price: 3499 }],
    rating: 4.8,
    reviews: 1542,
    badge: "PURE",
    image: "https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    description: "Kolhu-filtered single origin Saurashtra groundnuts. Deep nutty aroma, perfect for deep frying.",
    benefits: ["Single Origin", "High Smoke Point", "Rich in Vit E", "Zero Cholesterol"],
    nutrition: { energy: "884 kcal", fat: "100g", sat: "17g", trans: "0g" },
    bg: "#B8431A",
  },
  {
    productId: "s1l",
    name: "Refined Soyabean Oil",
    category: "soyabean",
    sizes: [{ label: "1L", price: 139 }, { label: "5L", price: 649 }],
    rating: 4.7,
    reviews: 987,
    badge: "LIGHT",
    image: "https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    description: "Six-stage refined MP soyabean oil. Light, neutral and heart-friendly - your everyday warrior.",
    benefits: ["6x Refined", "Heart Light", "Vit A+D Fortified", "Neutral Flavour"],
    nutrition: { energy: "884 kcal", fat: "100g", sat: "16g", trans: "0g" },
    bg: "#2B2A28",
  },
  {
    productId: "m5l",
    name: "Mustard Oil Family Jar",
    category: "mustard",
    sizes: [{ label: "5L", price: 1399 }, { label: "15L", price: 4049 }],
    rating: 4.9,
    reviews: 812,
    badge: "FAMILY",
    image: "https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    description: "The monthly ration your family deserves. Vacuum-sealed tins keep it fresh for 9 months.",
    benefits: ["Bulk Value", "Sealed Freshness", "Kachi Ghani", "Handmade"],
    nutrition: { energy: "900 kcal", fat: "100g", sat: "9g", trans: "0g" },
    bg: "#D98F00",
  },
  {
    productId: "g5l",
    name: "Groundnut Oil Tin",
    category: "groundnut",
    sizes: [{ label: "5L", price: 1199 }, { label: "15L", price: 3499 }],
    rating: 4.8,
    reviews: 621,
    badge: "TIN",
    image: "https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    description: "The authentic tin pack - built for the halwai, loved by the home cook.",
    benefits: ["Traditional Tin", "Cold Filtered", "Bulk Value", "Kolhu Pressed"],
    nutrition: { energy: "884 kcal", fat: "100g", sat: "17g", trans: "0g" },
    bg: "#B8431A",
  },
  {
    productId: "s5l",
    name: "Soyabean Family Pack",
    category: "soyabean",
    sizes: [{ label: "5L", price: 649 }, { label: "15L", price: 1899 }],
    rating: 4.6,
    reviews: 445,
    badge: "VALUE",
    image: "https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    description: "Light on the stomach, heavy on value. 15L of everyday goodness.",
    benefits: ["Family Size", "Vit A+D", "Refined", "Affordable"],
    nutrition: { energy: "884 kcal", fat: "100g", sat: "16g", trans: "0g" },
    bg: "#2B2A28",
  },
];

async function seed() {
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
}

seed()
  .then(async () => {
    console.log("Seed complete.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

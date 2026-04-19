import { prisma } from "../prisma/client.js";
import { nowIso } from "../utils/time.js";

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  return { items: cart?.items || [] };
}

export async function replaceCart(userId: string, items: any[]) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId, items, createdAt: nowIso(), updatedAt: nowIso() },
    update: { items, updatedAt: nowIso() },
  });
  return { items: cart.items };
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId, items: [], createdAt: nowIso(), updatedAt: nowIso() },
    update: { items: [], updatedAt: nowIso() },
  });
  return { items: cart.items };
}

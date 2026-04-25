import { prisma } from "../prisma/client.js";
import { AppError, toNumber } from "../utils/http.js";
import { prefixedId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export type ProductInput = {
  name: string;
  category: string;
  sizes: Array<{ label: string; price: number }>;
  description: string;
  badge?: string;
  images?: string[];
  bg?: string;
  benefits?: string[];
  nutrition?: Record<string, unknown>;
  rating?: number;
  reviews?: number;
  inventory?: number;
};

export function toPublicProduct(product: any) {
  return {
    product_id: product.productId,
    name: product.name,
    category: product.category,
    category_id: product.categoryId,
    sizes: product.sizes,
    description: product.description,
    badge: product.badge,
    images: product.images || [],
    image: product.images?.[0] || "", // backward compatibility
    bg: product.bg,
    benefits: product.benefits || [],
    nutrition: product.nutrition || {},
    rating: product.rating,
    reviews: product.reviews,
    inventory: product.inventory,
    active: product.active,
    created_at: product.createdAt,
  };
}

function normalizeProduct(input: ProductInput) {
  const images = (input.images && input.images.length > 0) ? input.images : ((input as any).image ? [(input as any).image] : []);
  return {
    name: input.name,
    category: input.category,
    sizes: (input.sizes || []).map((size) => ({ label: size.label, price: toNumber(size.price) })),
    description: input.description,
    badge: input.badge || "NEW",
    images: images.filter(Boolean),
    bg: input.bg || "#D98F00",
    benefits: input.benefits || [],
    nutrition: (input.nutrition || {}) as any,
    rating: toNumber(input.rating, 4.8),
    reviews: Math.trunc(toNumber(input.reviews, 0)),
    inventory: Math.trunc(toNumber(input.inventory, 0)),
  };
}

export async function listProducts(filters: { cat?: string; q?: string }) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  const q = filters.q?.toLowerCase().trim();

  return products
    .filter((product) => !filters.cat || filters.cat === "all" || product.category === filters.cat)
    .filter((product) => {
      if (!q) return true;
      return [product.name, product.description, product.category, product.badge]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    })
    .map(toPublicProduct);
}

export async function getProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { productId } });
  if (!product) throw new AppError(404, "Not found");
  return toPublicProduct(product);
}

export async function createProduct(input: ProductInput) {
  const normalized = normalizeProduct(input);
  const product = await prisma.product.create({
    data: {
      productId: prefixedId("prod", 5),
      ...normalized,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  });
  return toPublicProduct(product);
}

export async function updateProduct(productId: string, input: ProductInput) {
  const product = await prisma.product.update({
    where: { productId },
    data: { ...normalizeProduct(input), updatedAt: nowIso() },
  }).catch(() => null);

  if (!product) throw new AppError(404, "Not found");
  return toPublicProduct(product);
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { productId } }).catch(() => {
    throw new AppError(404, "Not found");
  });
  return { ok: true };
}

export async function bulkImportProducts(products: ProductInput[]) {
  const created: string[] = [];
  for (const input of products) {
    const normalized = normalizeProduct(input);
    const product = await prisma.product.create({
      data: {
        productId: prefixedId("prod", 5),
        ...normalized,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    });
    created.push(product.productId);
  }
  return { created: created.length, product_ids: created };
}

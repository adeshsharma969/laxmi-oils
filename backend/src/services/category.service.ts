import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/http.js";
import { prefixedId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export function toPublicCategory(category: any) {
  return {
    category_id: category.categoryId,
    slug: category.slug,
    name: category.name,
    description: category.description,
  };
}

export async function listCategories() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories.map(toPublicCategory);
}

export async function createCategory(input: { slug: string; name: string; description?: string }) {
  const category = await prisma.category.create({
    data: {
      categoryId: prefixedId("cat", 5),
      slug: input.slug,
      name: input.name,
      description: input.description,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  });
  return toPublicCategory(category);
}

export async function updateCategory(slug: string, input: { name?: string; description?: string }) {
  const category = await prisma.category.update({ where: { slug }, data: { ...input, updatedAt: nowIso() } }).catch(() => null);
  if (!category) throw new AppError(404, "Category not found");
  return toPublicCategory(category);
}

export async function deleteCategory(slug: string) {
  await prisma.category.delete({ where: { slug } }).catch(() => {
    throw new AppError(404, "Category not found");
  });
  return { ok: true };
}

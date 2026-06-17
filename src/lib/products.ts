import { prisma } from "./prisma";

export { CATEGORIES, getCategory } from "./categories";
export { formatARS, totalStock } from "./format";
import { getCategory } from "./categories";

export async function getAllActiveProducts() {
  return prisma.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getProductsByCategory(slug: string) {
  const category = getCategory(slug);
  if (!category) return [];
  return prisma.product.findMany({
    where: {
      active: true,
      prefix: { in: category.filter.prefix },
      ...(category.filter.gender ? { gender: category.filter.gender } : {}),
    },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
  });
}

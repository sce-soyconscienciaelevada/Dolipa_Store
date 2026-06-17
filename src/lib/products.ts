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

export async function getFeaturedProducts(take = 4, skip = 0) {
  return prisma.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
}

export async function getNewestProducts(take = 4) {
  return getFeaturedProducts(take, 0);
}

export async function getCategoryCoverImage(slug: string): Promise<string | null> {
  const category = getCategory(slug);
  if (!category) return null;
  const product = await prisma.product.findFirst({
    where: {
      active: true,
      prefix: { in: category.filter.prefix },
      ...(category.filter.gender ? { gender: category.filter.gender } : {}),
    },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "asc" },
  });
  return product?.images[0]?.url ?? null;
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

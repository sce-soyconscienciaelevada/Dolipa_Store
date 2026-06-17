import { prisma } from "./prisma";

export async function getInventorySummary() {
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const outOfStock = products.filter((p) => p.variants.every((v) => v.stock === 0)).length;
  const catalogValue = products.reduce(
    (sum, p) => sum + p.price * p.variants.reduce((s, v) => s + v.stock, 0),
    0
  );

  return { totalProducts, activeProducts, outOfStock, catalogValue };
}

export async function getSalesSummary() {
  const sales = await prisma.sale.findMany({ orderBy: { soldAt: "desc" } });

  const totalRevenue = sales.reduce((sum, s) => sum + s.price, 0);
  const totalUnits = sales.length;

  const byDay = new Map<string, { units: number; revenue: number }>();
  for (const s of sales) {
    const day = s.soldAt.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { units: 0, revenue: 0 };
    entry.units += 1;
    entry.revenue += s.price;
    byDay.set(day, entry);
  }
  const salesByDay = Array.from(byDay.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => (a.day < b.day ? 1 : -1))
    .slice(0, 30);

  const byProductSize = new Map<
    string,
    { categoria: string; brand: string; size: string; units: number; revenue: number }
  >();
  for (const s of sales) {
    const key = `${s.productId ?? s.categoria}__${s.size}`;
    const entry =
      byProductSize.get(key) ?? { categoria: s.categoria, brand: s.brand, size: s.size, units: 0, revenue: 0 };
    entry.units += 1;
    entry.revenue += s.price;
    byProductSize.set(key, entry);
  }
  const topProducts = Array.from(byProductSize.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  return { totalRevenue, totalUnits, salesByDay, topProducts, recentSales: sales.slice(0, 10) };
}

export function formatARS(price: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    price
  );
}

export function totalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

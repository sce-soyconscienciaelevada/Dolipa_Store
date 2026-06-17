export type CategorySlug = "remeras-hombre" | "remeras-mujer" | "buzos-y-camperas" | "bermudas-y-shorts";

export const CATEGORIES: { slug: CategorySlug; label: string; filter: { prefix: string[]; gender?: string } }[] = [
  { slug: "remeras-hombre", label: "Remeras Hombre", filter: { prefix: ["REM"], gender: "H" } },
  { slug: "remeras-mujer", label: "Remeras Mujer", filter: { prefix: ["REM"], gender: "M" } },
  { slug: "buzos-y-camperas", label: "Buzos y Camperas", filter: { prefix: ["BUZ", "CAM"] } },
  { slug: "bermudas-y-shorts", label: "Bermudas y Shorts", filter: { prefix: ["BER", "SHO"] } },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryForProduct(prefix: string, gender: string) {
  return CATEGORIES.find(
    (c) => c.filter.prefix.includes(prefix) && (!c.filter.gender || c.filter.gender === gender)
  );
}

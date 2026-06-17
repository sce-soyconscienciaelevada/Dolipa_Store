import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory, getProductsByCategory, CATEGORIES } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.label} -- Dolipa Store Villa Carlos Paz`,
    description: `${category.label} importadas en Dolipa Store, Villa Carlos Paz. Envíos a todo el Valle de Punilla.`,
    alternates: { canonical: `/categoria/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <section className="px-6 py-8">
      <h1 className="font-serif text-2xl text-center mb-6">{category.label}</h1>
      {products.length === 0 ? (
        <p className="text-center text-neutral-500">No hay productos en esta categoría todavía.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

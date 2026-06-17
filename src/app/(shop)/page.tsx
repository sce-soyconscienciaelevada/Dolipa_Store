import Link from "next/link";
import { getFeaturedProducts, getNewestProducts, getCategoryCoverImage, CATEGORIES } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import TrustBar from "@/components/TrustBar";

export default async function HomePage() {
  const [newest, featured, categoryCovers] = await Promise.all([
    getNewestProducts(4),
    getFeaturedProducts(4, 4),
    Promise.all(CATEGORIES.map((c) => getCategoryCoverImage(c.slug))),
  ]);

  return (
    <>
      <TrustBar />

      <section className="bg-dolipa-ink text-dolipa-cream text-center py-16 px-6">
        <h1 className="font-serif text-3xl sm:text-4xl mb-3">Ropa Importada en Villa Carlos Paz</h1>
        <p className="text-sm sm:text-base opacity-80 mb-6">
          Levi&apos;s® · Puma® · Adidas® -- stock limitado, envíos a todo el Valle de Punilla
        </p>
        <Link
          href="/categoria/remeras-hombre"
          className="inline-block bg-dolipa-cream text-dolipa-ink font-bold px-6 py-3 rounded text-sm uppercase tracking-wide hover:opacity-90"
        >
          Ver Catálogo
        </Link>
      </section>

      {newest.length > 0 && (
        <section className="px-6 py-8">
          <h2 className="font-serif text-2xl text-center mb-6">Recién llegados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="px-6 py-8 bg-neutral-50">
        <h2 className="font-serif text-2xl text-center mb-6">Comprá por categoría</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.slug} slug={c.slug} label={c.label} image={categoryCovers[i]} />
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="px-6 py-8">
          <h2 className="font-serif text-2xl text-center mb-6">Destacados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

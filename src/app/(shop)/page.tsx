import Link from "next/link";
import { getFeaturedProducts, CATEGORIES } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const products = await getFeaturedProducts(8);

  return (
    <>
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

      <section className="px-6 py-6 flex flex-wrap gap-3 justify-center">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className="border border-dolipa-ink rounded-full px-4 py-2 text-sm hover:bg-dolipa-ink hover:text-dolipa-cream transition"
          >
            {c.label}
          </Link>
        ))}
      </section>

      <section className="px-6 py-8">
        <h2 className="font-serif text-2xl text-center mb-6">Destacados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

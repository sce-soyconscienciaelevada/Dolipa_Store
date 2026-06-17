import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getProductBySlug, totalStock } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import AddToCartForm from "@/components/AddToCartForm";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const image = product.images[0]?.url;
  return {
    title: `${product.categoria} -- Dolipa Store Villa Carlos Paz`,
    description: product.description,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: product.categoria,
      description: product.description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const stock = totalStock(product.variants);
  const mainImage = product.images[0]?.url ?? "/logo.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.categoria,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className="px-6 py-8 max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <div className="relative w-full aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-3">
            <Image src={mainImage} alt={product.categoria} fill className="object-cover" priority />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img) => (
                <div key={img.id} className="relative w-20 h-24 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
                  <Image src={img.url} alt={product.categoria} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>
          <h1 className="font-serif text-2xl mt-1 mb-3">{product.categoria}</h1>
          <p className="text-sm text-neutral-600 whitespace-pre-line">{product.description}</p>
          <AddToCartForm
            productSlug={product.slug}
            productName={product.categoria}
            price={product.price}
            image={mainImage}
            variants={product.variants}
          />
        </div>
      </div>
    </section>
  );
}

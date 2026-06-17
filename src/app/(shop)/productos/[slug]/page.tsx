import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, totalStock } from "@/lib/products";
import { getCategoryForProduct } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import AddToCartForm from "@/components/AddToCartForm";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";

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
  const category = getCategoryForProduct(product.prefix, product.gender);

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
      <Breadcrumb
        items={
          category
            ? [{ label: category.label, href: `/categoria/${category.slug}` }, { label: product.categoria }]
            : [{ label: product.categoria }]
        }
      />
      <div className="grid sm:grid-cols-2 gap-8">
        <ProductGallery images={product.images} alt={product.categoria} />
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

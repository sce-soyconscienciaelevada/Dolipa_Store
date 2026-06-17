import Link from "next/link";
import Image from "next/image";
import { formatARS, totalStock } from "@/lib/format";

type Props = {
  product: {
    slug: string;
    categoria: string;
    brand: string;
    price: number;
    images: { url: string }[];
    variants: { stock: number }[];
  };
};

export default function ProductCard({ product }: Props) {
  const stock = totalStock(product.variants);
  const image = product.images[0]?.url ?? "/logo.jpg";

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="border border-black/10 rounded-lg overflow-hidden bg-white/50 hover:shadow-md transition block"
    >
      <div className="relative w-full aspect-[3/4] bg-neutral-100">
        <Image src={image} alt={product.categoria} fill className="object-cover" />
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <h3 className="text-sm font-medium mt-1">{product.categoria}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold">{formatARS(product.price)}</span>
          {stock <= 2 && stock > 0 && (
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">Últimas unidades</span>
          )}
          {stock === 0 && <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">Sin stock</span>}
        </div>
      </div>
    </Link>
  );
}

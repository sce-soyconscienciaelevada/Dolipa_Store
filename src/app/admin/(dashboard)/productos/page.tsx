import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatARS, totalStock } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true, images: { orderBy: { order: "asc" } } },
    orderBy: { categoria: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-serif text-2xl">Productos ({products.length})</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-dolipa-ink text-dolipa-cream px-4 py-2 rounded text-sm font-medium"
        >
          + Nuevo producto
        </Link>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm border-collapse min-w-[640px] sm:min-w-0 px-4 sm:px-0">
          <thead>
            <tr className="text-left border-b border-black/10 text-neutral-500">
              <th className="py-2"></th>
              <th className="py-2">Producto</th>
              <th className="py-2">Género</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Fotos</th>
              <th className="py-2">Activo</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = totalStock(p.variants);
              const cover = p.images[0]?.url;
              return (
                <tr key={p.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="py-2 pr-2">
                    <Link href={`/admin/productos/${p.id}`}>
                      <div className="relative w-10 h-12 bg-neutral-100 rounded overflow-hidden">
                        {cover && <Image src={cover} alt={p.categoria} fill className="object-cover" />}
                      </div>
                    </Link>
                  </td>
                  <td className="py-2">
                    <Link href={`/admin/productos/${p.id}`} className="font-medium hover:underline">
                      {p.categoria}
                    </Link>
                    <span className="text-neutral-400 ml-1">({p.brand})</span>
                  </td>
                  <td className="py-2">{p.gender === "H" ? "Hombre" : "Mujer"}</td>
                  <td className="py-2">{formatARS(p.price)}</td>
                  <td className="py-2">
                    {stock === 0 ? <span className="text-red-600">Sin stock</span> : stock}
                  </td>
                  <td className="py-2">{p.images.length}</td>
                  <td className="py-2">{p.active ? "Sí" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  updateProduct,
  addVariant,
  updateVariantStock,
  markVariantSold,
  deleteVariant,
  deleteImage,
  uploadImage,
} from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { size: "asc" } }, images: { orderBy: { order: "asc" } } },
  });
  if (!product) notFound();

  async function saveProduct(formData: FormData) {
    "use server";
    await updateProduct(id, formData);
  }

  async function addVariantAction(formData: FormData) {
    "use server";
    await addVariant(id, formData);
  }

  async function uploadImageAction(formData: FormData) {
    "use server";
    await uploadImage(id, formData);
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-serif text-2xl mb-6">{product.categoria}</h1>
        <form action={saveProduct} className="space-y-4 border border-black/10 rounded-lg p-6">
          <div>
            <label className="text-sm font-medium block mb-1">Categoría (nombre)</label>
            <input
              name="categoria"
              defaultValue={product.categoria}
              required
              className="w-full border border-black/20 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Marca</label>
            <input
              name="brand"
              defaultValue={product.brand}
              required
              className="w-full border border-black/20 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Precio (ARS)</label>
            <input
              name="price"
              type="number"
              defaultValue={product.price}
              required
              className="w-full border border-black/20 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={product.description}
              rows={5}
              className="w-full border border-black/20 rounded px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={product.active} />
            Producto activo (visible en la tienda)
          </label>
          <button type="submit" className="bg-dolipa-ink text-dolipa-cream px-4 py-2 rounded text-sm font-medium">
            Guardar cambios
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-serif text-xl mb-4">Talles y stock</h2>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-black/10">
              <th className="py-2">Talle</th>
              <th className="py-2">SKU</th>
              <th className="py-2">Stock</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => {
              async function updateStockAction(formData: FormData) {
                "use server";
                await updateVariantStock(v.id, id, Number(formData.get("stock")));
              }
              async function markSoldAction() {
                "use server";
                await markVariantSold(v.id, id);
              }
              async function deleteVariantAction() {
                "use server";
                await deleteVariant(v.id, id);
              }
              return (
                <tr key={v.id} className="border-b border-black/5">
                  <td className="py-2">{v.size}</td>
                  <td className="py-2 text-neutral-500">{v.sku}</td>
                  <td className="py-2">
                    <form action={updateStockAction} className="flex items-center gap-2">
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        defaultValue={v.stock}
                        className="w-16 border border-black/20 rounded px-2 py-1 text-sm"
                      />
                      <button type="submit" className="text-xs underline">
                        Actualizar
                      </button>
                    </form>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-3">
                      <form action={markSoldAction}>
                        <button type="submit" className="text-xs underline" title="Resta 1 al stock">
                          Marcar vendido
                        </button>
                      </form>
                      <form action={deleteVariantAction}>
                        <button type="submit" className="text-xs text-red-600 underline">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <form action={addVariantAction} className="flex gap-2 items-end border border-black/10 rounded-lg p-4">
          <div>
            <label className="text-xs font-medium block mb-1">Talle</label>
            <input name="size" required className="w-20 border border-black/20 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">SKU</label>
            <input name="sku" required className="w-40 border border-black/20 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={0}
              className="w-20 border border-black/20 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="bg-dolipa-ink text-dolipa-cream px-3 py-1.5 rounded text-sm">
            + Agregar talle
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-serif text-xl mb-4">Fotos</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {product.images.map((img) => {
            async function deleteImageAction() {
              "use server";
              await deleteImage(img.id, id);
            }
            return (
              <div key={img.id} className="relative">
                <div className="relative w-full aspect-[3/4] bg-neutral-100 rounded overflow-hidden">
                  <Image src={img.url} alt={product.categoria} fill className="object-cover" />
                </div>
                <form action={deleteImageAction} className="mt-1">
                  <button type="submit" className="text-xs text-red-600 underline">
                    Eliminar
                  </button>
                </form>
              </div>
            );
          })}
        </div>
        <form action={uploadImageAction} className="flex gap-2 items-center">
          <input type="file" name="file" accept="image/*" required className="text-sm" />
          <button type="submit" className="bg-dolipa-ink text-dolipa-cream px-3 py-1.5 rounded text-sm">
            Subir foto
          </button>
        </form>
      </div>
    </div>
  );
}

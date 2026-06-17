import { redirect } from "next/navigation";
import { createProduct } from "../../actions";

export default function NewProductPage() {
  async function action(formData: FormData) {
    "use server";
    const id = await createProduct(formData);
    redirect(`/admin/productos/${id}`);
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl mb-6">Nuevo producto</h1>
      <form action={action} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Categoría (nombre del producto)</label>
          <input name="categoria" required className="w-full border border-black/20 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Marca</label>
          <input name="brand" required className="w-full border border-black/20 rounded px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Género</label>
            <select name="gender" className="w-full border border-black/20 rounded px-3 py-2 text-sm">
              <option value="H">Hombre</option>
              <option value="M">Mujer</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Tipo de prenda</label>
            <select name="prefix" className="w-full border border-black/20 rounded px-3 py-2 text-sm">
              <option value="REM">Remera</option>
              <option value="BUZ">Buzo</option>
              <option value="CAM">Campera</option>
              <option value="BER">Bermuda</option>
              <option value="SHO">Short</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Color</label>
          <input name="color" defaultValue="Sin color" className="w-full border border-black/20 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Precio (ARS)</label>
          <input name="price" type="number" required className="w-full border border-black/20 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Descripción</label>
          <textarea name="description" rows={4} className="w-full border border-black/20 rounded px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-dolipa-ink text-dolipa-cream px-4 py-2 rounded text-sm font-medium">
          Crear producto
        </button>
      </form>
    </div>
  );
}

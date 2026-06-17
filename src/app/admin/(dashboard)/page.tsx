import Link from "next/link";
import { getInventorySummary } from "@/lib/admin-stats";
import { formatARS } from "@/lib/format";

export default async function AdminHomePage() {
  const summary = await getInventorySummary();

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Inicio</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="border border-black/10 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Productos</p>
          <p className="text-2xl font-bold">{summary.totalProducts}</p>
        </div>
        <div className="border border-black/10 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Activos</p>
          <p className="text-2xl font-bold">{summary.activeProducts}</p>
        </div>
        <div className="border border-black/10 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Sin stock</p>
          <p className={`text-2xl font-bold ${summary.outOfStock > 0 ? "text-red-600" : ""}`}>
            {summary.outOfStock}
          </p>
        </div>
        <div className="border border-black/10 rounded-lg p-4">
          <p className="text-xs text-neutral-500 mb-1">Valor de inventario</p>
          <p className="text-2xl font-bold">{formatARS(summary.catalogValue)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/productos" className="bg-dolipa-ink text-dolipa-cream px-4 py-2 rounded text-sm font-medium">
          Ver productos
        </Link>
        <Link href="/admin/productos/nuevo" className="border border-dolipa-ink px-4 py-2 rounded text-sm font-medium">
          Nuevo producto
        </Link>
        <Link href="/admin/estadisticas" className="border border-dolipa-ink px-4 py-2 rounded text-sm font-medium">
          Ver estadísticas
        </Link>
      </div>
    </div>
  );
}

import { getInventorySummary, getSalesSummary } from "@/lib/admin-stats";
import { formatARS } from "@/lib/format";
import { deleteSale } from "../actions";

export default async function EstadisticasPage() {
  const [inventory, sales] = await Promise.all([getInventorySummary(), getSalesSummary()]);

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl">Estadísticas</h1>

      <div>
        <h2 className="font-serif text-lg mb-3">Ventas</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-black/10 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Ingresos totales</p>
            <p className="text-2xl font-bold">{formatARS(sales.totalRevenue)}</p>
          </div>
          <div className="border border-black/10 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Unidades vendidas</p>
            <p className="text-2xl font-bold">{sales.totalUnits}</p>
          </div>
        </div>

        {sales.totalUnits === 0 ? (
          <p className="text-sm text-neutral-500">
            Todavía no hay ventas registradas. Cada vez que marqués un talle como &quot;vendido&quot; en un
            producto, va a aparecer acá.
          </p>
        ) : (
          <>
            <h3 className="text-sm font-medium mb-2">Top productos por talle</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0 mb-6">
            <table className="w-full text-sm min-w-[480px] sm:min-w-0 px-4 sm:px-0">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-black/10">
                  <th className="py-1.5">Producto</th>
                  <th className="py-1.5">Talle</th>
                  <th className="py-1.5">Unidades</th>
                  <th className="py-1.5">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {sales.topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-1.5">
                      {p.categoria} <span className="text-neutral-400">({p.brand})</span>
                    </td>
                    <td className="py-1.5">{p.size}</td>
                    <td className="py-1.5">{p.units}</td>
                    <td className="py-1.5">{formatARS(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <h3 className="text-sm font-medium mb-2">Ventas por día (últimos 30 días)</h3>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-black/10">
                  <th className="py-1.5">Día</th>
                  <th className="py-1.5">Unidades</th>
                  <th className="py-1.5">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {sales.salesByDay.map((d) => (
                  <tr key={d.day} className="border-b border-black/5">
                    <td className="py-1.5">{d.day}</td>
                    <td className="py-1.5">{d.units}</td>
                    <td className="py-1.5">{formatARS(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="text-sm font-medium mb-2">Ventas recientes</h3>
            <p className="text-xs text-neutral-500 mb-2">
              ¿Marcaste algo vendido por error? Eliminalo acá -- repone 1 unidad de stock automáticamente.
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[560px] sm:min-w-0 px-4 sm:px-0">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-black/10">
                  <th className="py-1.5">Producto</th>
                  <th className="py-1.5">Talle</th>
                  <th className="py-1.5">Precio</th>
                  <th className="py-1.5">Fecha</th>
                  <th className="py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {sales.recentSales.map((s) => {
                  async function deleteSaleAction() {
                    "use server";
                    await deleteSale(s.id);
                  }
                  return (
                    <tr key={s.id} className="border-b border-black/5">
                      <td className="py-1.5">
                        {s.categoria} <span className="text-neutral-400">({s.brand})</span>
                      </td>
                      <td className="py-1.5">{s.size}</td>
                      <td className="py-1.5">{formatARS(s.price)}</td>
                      <td className="py-1.5">{s.soldAt.toLocaleString("es-AR")}</td>
                      <td className="py-1.5">
                        <form action={deleteSaleAction}>
                          <button type="submit" className="text-xs text-red-600 underline">
                            Eliminar (repone stock)
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      <div>
        <h2 className="font-serif text-lg mb-3">Inventario</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-black/10 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Productos</p>
            <p className="text-xl font-bold">{inventory.totalProducts}</p>
          </div>
          <div className="border border-black/10 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Activos</p>
            <p className="text-xl font-bold">{inventory.activeProducts}</p>
          </div>
          <div className="border border-black/10 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Sin stock</p>
            <p className="text-xl font-bold">{inventory.outOfStock}</p>
          </div>
          <div className="border border-black/10 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Valor de inventario</p>
            <p className="text-xl font-bold">{formatARS(inventory.catalogValue)}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Para visitas y tráfico del sitio, revisá el panel de Vercel Analytics en tu cuenta de Vercel.
      </p>
    </div>
  );
}

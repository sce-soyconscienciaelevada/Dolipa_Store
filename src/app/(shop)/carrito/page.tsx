"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, cartTotal, formatARSPlain } from "@/lib/cart-store";
import { buildWhatsAppCheckoutUrl } from "@/lib/whatsapp";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQty = useCartStore((s) => s.setQty);

  if (items.length === 0) {
    return (
      <section className="px-6 py-16 text-center">
        <p className="text-neutral-500 mb-4">Tu carrito está vacío.</p>
        <Link href="/" className="underline text-sm">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="px-6 py-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl mb-6">Tu pedido</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.sku} className="flex gap-4 border-b border-black/10 pb-4">
            <div className="relative w-16 h-20 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
              {item.image && <Image src={item.image} alt={item.productName} fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-neutral-500">Talle {item.size}</p>
              <div className="flex items-center gap-2 mt-2">
                <label className="text-xs">Cant.</label>
                <input
                  type="number"
                  min={1}
                  max={item.maxStock}
                  value={item.qty}
                  onChange={(e) => setQty(item.sku, Number(e.target.value))}
                  className="w-16 border border-black/20 rounded px-2 py-1 text-base"
                />
                <button onClick={() => removeItem(item.sku)} className="text-xs text-red-600 underline ml-2">
                  Quitar
                </button>
              </div>
            </div>
            <p className="text-sm font-bold">{formatARSPlain(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6 mb-6">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-lg">{formatARSPlain(cartTotal(items))}</span>
      </div>

      <a
        href={buildWhatsAppCheckoutUrl(items)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3.5 rounded-md hover:opacity-90"
      >
        📲 Finalizar por WhatsApp
      </a>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatARS } from "@/lib/format";

type Variant = { id: string; size: string; sku: string; stock: number };

type Props = {
  productSlug: string;
  productName: string;
  price: number;
  image: string | null;
  variants: Variant[];
};

export default function AddToCartForm({ productSlug, productName, price, image, variants }: Props) {
  const availableVariants = variants.filter((v) => v.stock > 0);
  const [selectedSku, setSelectedSku] = useState(availableVariants[0]?.sku ?? "");
  const [added, setAdded] = useState(false);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  if (availableVariants.length === 0) {
    return <p className="text-sm text-neutral-500 mt-4">Sin stock disponible en este momento.</p>;
  }

  const selected = availableVariants.find((v) => v.sku === selectedSku);
  const inCartQty = selected ? items.find((i) => i.sku === selected.sku)?.qty ?? 0 : 0;
  const atLimit = selected ? inCartQty >= selected.stock : false;

  function handleAdd() {
    if (!selected || atLimit) return;
    addItem({
      productSlug,
      productName,
      size: selected.size,
      sku: selected.sku,
      price,
      qty: 1,
      maxStock: selected.stock,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mt-4">
      <p className="text-xl font-bold mb-3">{formatARS(price)}</p>
      <p className="text-sm font-medium mb-2">Talle</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {availableVariants.map((v) => (
          <button
            key={v.sku}
            onClick={() => setSelectedSku(v.sku)}
            className={`border rounded px-3 py-1.5 text-sm ${
              selectedSku === v.sku ? "bg-dolipa-ink text-dolipa-cream border-dolipa-ink" : "border-black/20"
            }`}
          >
            {v.size}
          </button>
        ))}
      </div>
      {atLimit && (
        <p className="text-xs text-red-600 mb-2">
          Ya tenés en el carrito todo el stock disponible de este talle ({selected?.stock}).
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={atLimit}
          className="flex-1 bg-dolipa-ink text-dolipa-cream font-bold py-3 rounded text-sm uppercase tracking-wide hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {added ? "Agregado ✓" : "Agregar al carrito"}
        </button>
        <button
          onClick={() => {
            if (!atLimit) handleAdd();
            router.push("/carrito");
          }}
          className="flex-1 border border-dolipa-ink py-3 rounded text-sm uppercase tracking-wide hover:bg-dolipa-ink hover:text-dolipa-cream transition"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}

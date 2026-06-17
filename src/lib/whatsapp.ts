import type { CartItem } from "./cart-store";
import { cartTotal, formatARSPlain } from "./cart-store";

// "For now" per Joan 2026-06-17 -- may change.
export const WHATSAPP_NUMBER = "5493541641493";

export function buildWhatsAppCheckoutUrl(items: CartItem[]): string {
  const lines = [
    "Hola! Quiero hacer este pedido en Dolipa Store:",
    "",
    ...items.map((i) => `- ${i.productName} (Talle ${i.size}) x${i.qty} -- ${formatARSPlain(i.price * i.qty)}`),
    "",
    `Total: ${formatARSPlain(cartTotal(items))}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

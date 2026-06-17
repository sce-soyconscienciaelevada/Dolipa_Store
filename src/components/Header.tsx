"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { CATEGORIES } from "@/lib/categories";

export default function Header() {
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-black/10">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.jpg" alt="Dolipa Store" width={48} height={48} className="rounded-full" />
        <span className="font-serif text-lg font-bold tracking-wide hidden sm:inline">DOLIPA STORE</span>
      </Link>
      <nav className="hidden md:flex gap-6 text-sm uppercase tracking-wide">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/categoria/${c.slug}`} className="hover:opacity-70">
            {c.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/carrito"
        className="border border-dolipa-ink rounded-full px-4 py-2 text-sm font-medium hover:bg-dolipa-ink hover:text-dolipa-cream transition"
      >
        🛒 Carrito{count > 0 ? ` (${count})` : ""}
      </Link>
    </header>
  );
}

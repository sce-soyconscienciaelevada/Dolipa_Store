import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-xs text-neutral-500 mb-4 flex items-center gap-1.5 flex-wrap">
      <Link href="/" className="hover:underline">
        Inicio
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="opacity-50">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

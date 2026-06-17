import Link from "next/link";
import Image from "next/image";

type Props = {
  slug: string;
  label: string;
  image: string | null;
};

export default function CategoryCard({ slug, label, image }: Props) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className="relative block aspect-square rounded-lg overflow-hidden bg-neutral-100 group"
    >
      {image && (
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
      <span className="absolute bottom-3 left-3 text-white font-serif text-lg drop-shadow">{label}</span>
    </Link>
  );
}

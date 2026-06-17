"use client";

import { useState } from "react";
import Image from "next/image";

type Img = { id: string; url: string };

export default function ProductGallery({ images, alt }: { images: Img[]; alt: string }) {
  const [activeUrl, setActiveUrl] = useState(images[0]?.url ?? "/logo.jpg");

  return (
    <div>
      <div className="relative w-full aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-3">
        <Image src={activeUrl} alt={alt} fill className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveUrl(img.url)}
              className={`relative w-20 h-24 flex-shrink-0 bg-neutral-100 rounded overflow-hidden border-2 transition ${
                activeUrl === img.url ? "border-dolipa-ink" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={alt} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

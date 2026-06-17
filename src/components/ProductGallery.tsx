"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type Img = { id: string; url: string };

export default function ProductGallery({ images, alt }: { images: Img[]; alt: string }) {
  const safeImages = images.length > 0 ? images : [{ id: "fallback", url: "/logo.jpg" }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActiveIndex(i);
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(i);
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-lg bg-neutral-100 mb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {safeImages.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative w-full aspect-[3/4] flex-shrink-0 snap-start"
            aria-label="Ver imagen más grande"
          >
            <Image src={img.url} alt={alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" priority={i === 0} />
          </button>
        ))}
      </div>

      {safeImages.length > 1 && (
        <div className="flex justify-center gap-1.5 mb-3">
          {safeImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Imagen ${i + 1}`}
              className={`w-2 h-2 rounded-full transition ${i === activeIndex ? "bg-dolipa-ink" : "bg-black/20"}`}
            />
          ))}
        </div>
      )}

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {safeImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`relative w-20 h-24 flex-shrink-0 bg-neutral-100 rounded overflow-hidden border-2 transition ${
                i === activeIndex ? "border-dolipa-ink" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={safeImages}
          alt={alt}
          startIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  alt,
  startIndex,
  onIndexChange,
  onClose,
}: {
  images: Img[];
  alt: string;
  startIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center");

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function go(delta: number) {
    const next = (index + delta + images.length) % images.length;
    setIndex(next);
    onIndexChange(next);
    setZoomed(false);
  }

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setZoomed((z) => !z);
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black z-[999] flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl leading-none w-10 h-10 flex items-center justify-center"
        aria-label="Cerrar"
      >
        ✕
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          className="absolute left-2 sm:left-6 text-white text-3xl w-12 h-12 flex items-center justify-center"
          aria-label="Anterior"
        >
          ‹
        </button>
      )}

      <div
        className="relative w-full h-full max-w-3xl max-h-[85vh] mx-4 overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick(e);
        }}
      >
        <Image
          src={images[index].url}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain transition-transform duration-300 cursor-zoom-in"
          style={{ transform: zoomed ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
        />
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          className="absolute right-2 sm:right-6 text-white text-3xl w-12 h-12 flex items-center justify-center"
          aria-label="Siguiente"
        >
          ›
        </button>
      )}

      <p className="absolute bottom-4 text-white/70 text-xs">Tocá la imagen para hacer zoom</p>
    </div>,
    document.body
  );
}

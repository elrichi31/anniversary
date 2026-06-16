"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import type { MemoryItem } from "@/data/memories";

type MemoryGalleryProps = {
  activeIndex: number;
  items: MemoryItem[];
  onSelect: (index: number) => void;
};

export default function MemoryGallery({
  activeIndex,
  items,
  onSelect,
}: MemoryGalleryProps) {
  const active = items[activeIndex];

  return (
    <section className="gallery-card">
      <div className="gallery-stage">
        <div className="gallery-image-shell">
          {active.src ? (
            <Image
              src={active.src}
              alt={active.caption}
              fill
              sizes="(max-width: 740px) 92vw, 58vw"
              className="gallery-image"
              unoptimized
            />
          ) : (
            <div
              className="gallery-placeholder"
              style={{ "--placeholder-tone": active.tone } as CSSProperties}
            >
              <span>{active.date}</span>
              <strong>{active.caption}</strong>
              <p>Pon una foto real en `/public/photos/` y conecta su `src`.</p>
            </div>
          )}
        </div>

        <div className="gallery-meta">
          <p className="tiny-label">Archivo visual</p>
          <h2>{active.caption}</h2>
          <p>{active.date}</p>
        </div>
      </div>

      <div className="gallery-strip" aria-label="Seleccionar recuerdo">
        {items.map((item, index) => (
          <button
            key={`${item.date}-${item.caption}`}
            type="button"
            className={`gallery-thumb ${index === activeIndex ? "is-active" : ""}`}
            onClick={() => onSelect(index)}
          >
            {item.src ? (
              <Image
                src={item.src}
                alt={item.caption}
                fill
                sizes="96px"
                className="gallery-thumb__image"
                unoptimized
              />
            ) : (
              <div
                className="gallery-thumb__fallback"
                style={{ "--placeholder-tone": item.tone } as CSSProperties}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

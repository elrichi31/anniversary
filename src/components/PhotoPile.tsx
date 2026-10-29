"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MemoryItem } from "@/data/memories";
import { fireConfetti } from "@/lib/confetti";

type PhotoPileProps = {
  items: MemoryItem[];
};

type Slot = { x: number; y: number; rotation: number; scale: number };
type Layout = {
  stageW: number;
  stageH: number;
  centerY: number;
  sizes: { w: number; h: number }[];
  slots: Slot[];
};

// Cuanto scroll (en alto de pantalla) se dedica a cada foto.
const SCREENS_PER_PHOTO = 0.42;
const ENTER_SPAN = 0.85;
const HOLD_SPAN = 0.35;
const LEAVE_SPAN = 0.65;

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Numero pseudoaleatorio estable por indice (sin Math.random para no cambiar entre renders).
function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function bigSize(item: MemoryItem, stageWidth: number, usableHeight: number) {
  const base = Math.min(stageWidth * 0.74, 340, usableHeight * 0.58);
  return item.landscape
    ? { w: Math.min(base * 1.3, stageWidth * 0.86), h: base * 1.3 * 0.76 }
    : { w: base, h: base * 1.24 };
}

function computeLayout(items: MemoryItem[], width: number, height: number): Layout {
  const top = 92;
  const bottom = 84;
  const usableHeight = height - top - bottom;
  const centerY = top + usableHeight / 2;
  const cols = width < 600 ? 4 : width < 1000 ? 6 : 8;
  const rows = Math.ceil(items.length / cols);
  const cellW = width / cols;
  const cellH = usableHeight / rows;

  // Se reparten las casillas mezcladas para que no queden en orden cronologico.
  const order = items
    .map((_, index) => index)
    .sort((a, b) => seeded(a, 1) - seeded(b, 1));

  const slots: Slot[] = [];
  const sizes = items.map((item) => bigSize(item, width, usableHeight));
  order.forEach((photoIndex, position) => {
    const row = Math.floor(position / cols);
    const col = position % cols;
    const pileWidth = cellW * 1.32;
    const scale = pileWidth / sizes[photoIndex].w;
    // Mitad del alto que ocupa la foto ya reducida (con margen por la rotacion).
    const halfHeight = (sizes[photoIndex].h * scale) / 2 + 8;
    const rawY = top + row * cellH + cellH / 2 + (seeded(photoIndex, 3) - 0.5) * cellH * 0.3;
    const clampedY = clamp(rawY, top + halfHeight, height - bottom - halfHeight);
    slots[photoIndex] = {
      x: col * cellW + cellW / 2 + (seeded(photoIndex, 2) - 0.5) * cellW * 0.35 - width / 2,
      y: clampedY - centerY,
      rotation: (seeded(photoIndex, 4) - 0.5) * 18,
      scale,
    };
  });

  return { stageW: width, stageH: height, centerY, sizes, slots };
}

export default function PhotoPile({ items }: PhotoPileProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finishedRef = useRef(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [finished, setFinished] = useState(false);

  const total = items.length;
  const totalUnits = total + 1;

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;

      if (stage) {
        setLayout(computeLayout(items, stage.clientWidth, stage.clientHeight));
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useEffect(() => {
    if (!layout) {
      return;
    }

    let frame = 0;

    const render = () => {
      frame = 0;
      const section = sectionRef.current;
      const stage = stageRef.current;

      if (!section || !stage) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - stage.clientHeight;
      const progress = scrollable > 0 ? clamp(-rect.top / scrollable) : 0;
      const u = progress * totalUnits - ENTER_SPAN;

      const done = progress > 0.97;
      if (done !== finishedRef.current) {
        finishedRef.current = done;
        setFinished(done);
        if (done) {
          fireConfetti({ x: 0.5, y: 0.7, count: 90, spread: 80 });
        }
      }

      layout.slots.forEach((slot, index) => {
        const node = photoRefs.current[index];

        if (!node) {
          return;
        }

        const enter = easeOut(clamp((u - (index - ENTER_SPAN)) / ENTER_SPAN));
        const leave = easeInOut(clamp((u - (index + HOLD_SPAN)) / LEAVE_SPAN));
        const side = index % 2 ? 1 : -1;
        const tilt = side * (3 + seeded(index, 5) * 3);

        let x: number;
        let y: number;
        let rotation: number;
        let scale: number;

        if (leave > 0) {
          x = lerp(0, slot.x, leave);
          y = lerp(0, slot.y, leave);
          rotation = lerp(tilt, slot.rotation, leave);
          scale = lerp(1, slot.scale, leave);
        } else {
          x = lerp(side * layout.stageW * 0.35, 0, enter);
          y = lerp(layout.stageH * 0.85, 0, enter);
          rotation = lerp(side * 22, tilt, enter);
          scale = lerp(0.82, 1, enter);
        }

        node.style.opacity = String(clamp(enter * 3));
        node.style.zIndex = String(leave >= 1 ? index : 100 + index);
        node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
      });
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [layout, total, totalUnits]);

  return (
    <section
      ref={sectionRef}
      className="pile-section"
      style={{ height: `${100 + totalUnits * SCREENS_PER_PHOTO * 100}svh` }}
      aria-label="Nuestros recuerdos"
    >
      <div ref={stageRef} className="pile-stage">
        <header className="pile-header">
          <p className="pile-kicker">Nuestros recuerdos</p>
          <h2 className={finished ? "pile-title pile-title--done" : "pile-title"}>
            {finished ? "Y los que nos faltan 💖" : "Sigue bajando…"}
          </h2>
        </header>

        {layout
          ? items.map((item, index) => {
              const size = layout.sizes[index];

              return (
                <div
                  key={item.src}
                  ref={(node) => {
                    photoRefs.current[index] = node;
                  }}
                  className="pile-photo"
                  style={
                    {
                      width: `${size.w}px`,
                      height: `${size.h}px`,
                      top: `${layout.centerY - size.h / 2}px`,
                      marginLeft: `${-size.w / 2}px`,
                      opacity: 0,
                    } as CSSProperties
                  }
                >
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.caption}
                      fill
                      sizes="(max-width: 600px) 76vw, 400px"
                      loading="eager"
                      className="pile-photo-image"
                      style={{ objectPosition: `50% ${item.focusY}%` }}
                    />
                  ) : null}
                </div>
              );
            })
          : null}
      </div>
    </section>
  );
}

"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { fireConfetti } from "@/lib/confetti";

type BalloonsProps = {
  count?: number;
  // Si es true, los globos se pueden reventar con un toque.
  interactive?: boolean;
};

const palette = ["#ff5d8f", "#f6c86f", "#79dfca", "#a3b7ff", "#ff8f5b", "#c89bff"];

// Valores fijos por indice para que servidor y cliente pinten lo mismo.
// Los globos cercanos suben por los costados para no tapar el texto del centro;
// los lejanos (mas chicos y difuminados) pueden cruzar por detras.
function balloonAt(index: number) {
  const far = index % 3 === 2;
  const side = index % 2 === 0 ? 0 : 1;
  const lane = ((index * 37) % 15) + 1;

  return {
    id: index,
    far,
    color: palette[index % palette.length],
    left: far ? (index * 29 + 12) % 86 : side === 0 ? lane : 100 - lane - 12,
    size: far ? 2.4 + ((index * 5) % 3) * 0.3 : 3.6 + ((index * 13) % 4) * 0.5,
    duration: far ? 24 + ((index * 7) % 8) : 14 + ((index * 7) % 8),
    delay: -((index * 53) % 21),
    sway: 14 + ((index * 11) % 22),
  };
}

export default function Balloons({ count = 9, interactive = true }: BalloonsProps) {
  const [popped, setPopped] = useState<number[]>([]);

  const pop = (id: number, color: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    fireConfetti({
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 3) / window.innerHeight,
      count: 40,
      spread: 360,
      power: 0.6,
      colors: [color, "#fff8ef", "#f6c86f"],
    });
    setPopped((current) => [...current, id]);
    window.setTimeout(() => {
      setPopped((current) => current.filter((value) => value !== id));
    }, 4500);
  };

  return (
    <div className="balloons" aria-hidden={!interactive}>
      {Array.from({ length: count }, (_, index) => balloonAt(index)).map((balloon) =>
        popped.includes(balloon.id) ? null : (
          <button
            key={balloon.id}
            type="button"
            className={`balloon ${balloon.far ? "balloon--far" : ""}`}
            tabIndex={interactive ? 0 : -1}
            disabled={!interactive}
            aria-label="Reventar globo"
            onClick={(event) => pop(balloon.id, balloon.color, event.currentTarget)}
            style={
              {
                "--balloon-color": balloon.color,
                "--balloon-left": `${balloon.left}%`,
                "--balloon-size": `${balloon.size}rem`,
                "--balloon-duration": `${balloon.duration}s`,
                "--balloon-delay": `${balloon.delay}s`,
                "--balloon-sway": `${balloon.sway}px`,
              } as CSSProperties
            }
          >
            <span className="balloon-sway">
              <svg viewBox="0 0 60 100" focusable="false" aria-hidden="true">
                <defs>
                  <radialGradient id="balloon-shade" cx="35%" cy="28%" r="75%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
                    <stop offset="45%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
                  </radialGradient>
                </defs>
                <path
                  d="M30 78 q-6 10 0 18 q6 8 0 16"
                  fill="none"
                  stroke="rgba(255,248,239,0.55)"
                  strokeWidth="1.4"
                />
                <ellipse cx="30" cy="32" rx="26" ry="31" fill="currentColor" />
                <ellipse cx="30" cy="32" rx="26" ry="31" fill="url(#balloon-shade)" />
                <path d="M30 63 l-4.5 7 h9 z" fill="currentColor" />
              </svg>
            </span>
          </button>
        ),
      )}
    </div>
  );
}

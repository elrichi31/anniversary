"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "@/lib/confetti";
import { useInView } from "@/lib/useInView";

type CakeProps = {
  age: number;
};

const candleXs = [112, 131, 150, 169, 188];

export default function Cake({ age }: CakeProps) {
  const [blockRef, inView] = useInView<HTMLDivElement>(0.35);
  const [blown, setBlown] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const blownRef = useRef(false);

  const setBlownState = (value: boolean) => {
    blownRef.current = value;
    setBlown(value);
  };

  const blowOut = () => {
    if (blownRef.current) {
      return;
    }

    setBlownState(true);
    fireConfetti({ x: 0.5, y: 0.55, count: 140, spread: 90, power: 1.25 });
    fireConfetti({ x: 0.1, y: 0.8, count: 60, spread: 50, power: 1.1 });
    fireConfetti({ x: 0.9, y: 0.8, count: 60, spread: 50, power: 1.1 });
  };

  const stopListening = () => {
    stopListeningRef.current?.();
    stopListeningRef.current = null;
    setListening(false);
  };

  // Detecta un soplido con el microfono: un golpe sostenido de volumen.
  const listenForBlow = async () => {
    setMicError(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let loudFrames = 0;
      let raf = 0;

      const cleanup = () => {
        window.cancelAnimationFrame(raf);
        stream.getTracks().forEach((track) => track.stop());
        void audioContext.close();
      };

      const check = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) {
          const centered = (value - 128) / 128;
          sum += centered * centered;
        }
        loudFrames = Math.sqrt(sum / data.length) > 0.12 ? loudFrames + 1 : 0;

        if (loudFrames > 12) {
          cleanup();
          stopListeningRef.current = null;
          setListening(false);
          blowOut();
          return;
        }

        raf = window.requestAnimationFrame(check);
      };

      stopListeningRef.current = cleanup;
      setListening(true);
      check();
    } catch {
      setMicError(true);
    }
  };

  useEffect(() => () => stopListeningRef.current?.(), []);

  return (
    <div ref={blockRef} className="cake-block">
      <svg
        className={`cake ${inView ? "cake--in" : ""} ${blown ? "cake--blown" : ""}`}
        viewBox="0 0 300 270"
        role="img"
        aria-label={blown ? "Pastel con las velitas apagadas" : "Pastel con velitas encendidas"}
      >
        <defs>
          <linearGradient id="cake-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8fb4" />
            <stop offset="100%" stopColor="#f0527f" />
          </linearGradient>
          <linearGradient id="cake-middle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe3a8" />
            <stop offset="100%" stopColor="#f6c86f" />
          </linearGradient>
          <linearGradient id="cake-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9f1e7" />
            <stop offset="100%" stopColor="#79dfca" />
          </linearGradient>
          <radialGradient id="flame-glow">
            <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="cake-plate">
          <ellipse cx="150" cy="248" rx="132" ry="14" fill="rgba(0,0,0,0.35)" />
          <ellipse cx="150" cy="240" rx="128" ry="13" fill="#fff8ef" />
        </g>

        <g className="cake-tier cake-tier--1">
<rect x="34" y="168" width="232" height="72" rx="14" fill="url(#cake-bottom)" />
        <path
          d="M34 182 q0 -14 14 -14 h204 q14 0 14 14 q-12 20 -26 6 q-12 22 -28 4 q-14 24 -30 2 q-16 22 -32 2 q-16 20 -32 2 q-16 20 -32 0 q-14 18 -30 -2 q-14 14 -22 -4 z"
          fill="#fff8ef"
        />
        </g>

        <g className="cake-tier cake-tier--2">
<rect x="66" y="118" width="168" height="56" rx="12" fill="url(#cake-middle)" />
        <path
          d="M66 130 q0 -12 12 -12 h144 q12 0 12 12 q-10 18 -22 4 q-12 18 -26 2 q-14 20 -28 2 q-14 18 -28 0 q-12 16 -24 -2 q-12 10 -20 -6 z"
          fill="#fff8ef"
        />
        </g>

        <g className="cake-tier cake-tier--3">
<rect x="98" y="76" width="104" height="48" rx="12" fill="url(#cake-top)" />
        <path
          d="M98 88 q0 -12 12 -12 h80 q12 0 12 12 q-8 14 -18 3 q-10 14 -22 2 q-12 14 -22 0 q-10 12 -22 -2 q-8 8 -20 -3 z"
          fill="#fff8ef"
        />
        </g>

        <g className="cake-sprinkles">
        {[
          [58, 205, "#fff8ef", -20],
          [92, 214, "#f6c86f", 25],
          [128, 202, "#79dfca", -35],
          [168, 216, "#a3b7ff", 15],
          [206, 204, "#fff8ef", 30],
          [240, 214, "#f6c86f", -15],
          [90, 150, "#ff5d8f", 20],
          [150, 146, "#fff8ef", -30],
          [206, 152, "#ff5d8f", 35],
        ].map(([x, y, color, angle]) => (
          <rect
            key={`${x}-${y}`}
            x={Number(x)}
            y={Number(y)}
            width="12"
            height="4"
            rx="2"
            fill={String(color)}
            transform={`rotate(${angle} ${Number(x) + 6} ${Number(y) + 2})`}
          />
        ))}
        </g>

        {candleXs.map((x, index) => (
          <g key={x} className="cake-candle" style={{ "--i": index } as CSSProperties}>
            <rect
              x={x - 4}
              y="44"
              width="8"
              height="34"
              rx="3"
              fill={index % 2 ? "#ff8fb4" : "#a3b7ff"}
            />
            <path
              d={`M${x - 4} 52 l8 5 M${x - 4} 62 l8 5 M${x - 4} 72 l8 5`}
              stroke="#fff8ef"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <rect x={x - 0.8} y="38" width="1.6" height="7" rx="0.8" fill="#4a3224" />
            <g
              className="cake-flame"
              style={{ "--i": index, "--flick": `${index * -0.37}s` } as CSSProperties}
            >
              <circle cx={x} cy="30" r="16" fill="url(#flame-glow)" />
              <path
                d={`M${x} 14 C${x + 8} 24 ${x + 6} 36 ${x} 37 C${x - 6} 36 ${x - 8} 24 ${x} 14 Z`}
                fill="#ffb23d"
              />
              <path
                d={`M${x} 23 C${x + 4} 29 ${x + 3} 35 ${x} 36 C${x - 3} 35 ${x - 4} 29 ${x} 23 Z`}
                fill="#fff2b8"
              />
            </g>
            <path
              className="cake-smoke"
              style={{ animationDelay: `${index * 0.12}s` }}
              d={`M${x} 36 c-6 -8 6 -14 0 -22 c-5 -7 4 -12 1 -18`}
              fill="none"
              stroke="rgba(255,248,239,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      <p className="cake-age">{age} años</p>

      <div className="cake-actions">
        {blown ? (
          <>
            <p className="cake-wish">Que se cumpla tu deseo ✨</p>
            <button type="button" className="ghost-button" onClick={() => setBlownState(false)}>
              Prender las velitas otra vez
            </button>
          </>
        ) : (
          <>
            <p className="cake-hint">Pide un deseo y sopla las velitas</p>
            <button type="button" className="primary-button" onClick={blowOut}>
              Soplar velitas 🎂
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={listening ? stopListening : listenForBlow}
            >
              {listening ? "Escuchando… sopla fuerte 🎤" : "O sopla de verdad (micrófono)"}
            </button>
            {micError ? (
              <p className="cake-error">No pude usar el micrófono, usa el botón.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

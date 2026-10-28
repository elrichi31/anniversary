"use client";

import type { CSSProperties } from "react";
import { useInView } from "@/lib/useInView";

type WordRevealProps = {
  text: string;
  className?: string;
  // Retraso inicial en milisegundos.
  delay?: number;
};

// Aparece palabra por palabra (con desenfoque) al entrar en pantalla.
export default function WordReveal({ text, className = "", delay = 0 }: WordRevealProps) {
  const [ref, shown] = useInView<HTMLParagraphElement>(0.5);

  return (
    <p ref={ref} className={`words ${shown ? "words--in" : ""} ${className}`} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="word"
          aria-hidden="true"
          style={{ "--word-delay": `${delay + index * 110}ms` } as CSSProperties}
        >
          {word}
        </span>
      ))}
    </p>
  );
}

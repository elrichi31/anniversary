"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/useInView";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "zoom" | "blur" | "unfold";
};

// Muestra el contenido con una animacion la primera vez que entra en pantalla.
export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const [ref, shown] = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal reveal--${variant} ${shown ? "reveal--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

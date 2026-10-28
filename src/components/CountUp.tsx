"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/useInView";

type CountUpProps = {
  // Numero ya formateado con ceros a la izquierda, por ejemplo "03".
  value: string;
};

// Cuenta de 0 al valor la primera vez que se ve; despues muestra el valor en vivo.
export default function CountUp({ value }: CountUpProps) {
  const [ref, shown] = useInView<HTMLSpanElement>(0.4);
  const [counting, setCounting] = useState<string | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const target = Number(valueRef.current);

    if (!shown || Number.isNaN(target)) {
      return;
    }

    const width = valueRef.current.length;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounting(String(Math.round(target * eased)).padStart(width, "0"));

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      } else {
        setCounting(null);
      }
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [shown]);

  const waiting = !shown && !Number.isNaN(Number(value));

  return <span ref={ref}>{waiting ? "0".repeat(value.length) : (counting ?? value)}</span>;
}

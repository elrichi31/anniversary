import { useEffect, useRef, useState } from "react";

// Devuelve true (y se queda en true) cuando el elemento entra en pantalla por primera vez.
export function useInView<T extends Element>(threshold = 0.2, rootMargin = "0px 0px -8% 0px") {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, shown] as const;
}

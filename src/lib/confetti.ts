export type ConfettiOptions = {
  // Origen como fraccion del viewport (0 a 1).
  x?: number;
  y?: number;
  count?: number;
  // Apertura del abanico en grados, centrada hacia arriba.
  spread?: number;
  power?: number;
  colors?: string[];
};

export const CONFETTI_EVENT = "birthday:confetti";

export function fireConfetti(options: ConfettiOptions = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<ConfettiOptions>(CONFETTI_EVENT, { detail: options }));
}

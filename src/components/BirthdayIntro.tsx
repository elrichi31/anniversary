"use client";

import Balloons from "@/components/Balloons";
import type { CountdownParts } from "@/lib/time";

type BirthdayIntroProps = {
  name: string;
  countdown: CountdownParts;
  canEnter: boolean;
  lockedLabel: string;
  onEnter: () => void;
};

const tiles: { key: keyof CountdownParts; label: string }[] = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Seg" },
];

export default function BirthdayIntro({
  name,
  countdown,
  canEnter,
  lockedLabel,
  onEnter,
}: BirthdayIntroProps) {
  return (
    <main className="intro-page">
      <Balloons count={7} interactive={canEnter} />

      <section className="intro-hero">
        <h1 className="intro-title">
          <span className="shimmer-text">
            {canEnter ? "Ya es tu día" : "Falta poquito para tu día"}
          </span>
          <span aria-hidden="true" className="bounce-emoji"> 🎁</span>
        </h1>

        <div className="intro-countdown" aria-live="polite">
          {tiles.map((tile) => (
            <article key={tile.key}>
              <span key={countdown[tile.key]} className="tick">
                {countdown[tile.key]}
              </span>
              <p>{tile.label}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="primary-button intro-button"
          disabled={!canEnter}
          onClick={onEnter}
        >
          {canEnter ? "Abrir sorpresa 🎉" : lockedLabel}
        </button>
      </section>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Balloons from "@/components/Balloons";
import Cake from "@/components/Cake";
import PhotoPile from "@/components/PhotoPile";
import Reveal from "@/components/Reveal";
import SoundtrackSection from "@/components/SoundtrackSection";
import { birthdayConfig, letterParagraphs } from "@/data/birthday";
import { memories } from "@/data/memories";
import { fireConfetti } from "@/lib/confetti";
import type { TogetherParts } from "@/lib/time";

type BirthdayStoryProps = {
  together: TogetherParts;
};

const togetherTiles: { key: keyof TogetherParts; label: string }[] = [
  { key: "years", label: "Años" },
  { key: "months", label: "Meses" },
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
];

export default function BirthdayStory({ together }: BirthdayStoryProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const timers = [
      window.setTimeout(() => fireConfetti({ x: 0.5, y: 0.65, count: 140, spread: 80, power: 1.2 }), 350),
      window.setTimeout(() => fireConfetti({ x: 0.08, y: 0.85, count: 70, spread: 50 }), 650),
      window.setTimeout(() => fireConfetti({ x: 0.92, y: 0.85, count: 70, spread: 50 }), 650),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <main className="story">
      <section className="hero">
        <Balloons count={10} />
        <div className="hero-copy">
          <p className="eyebrow">Para {birthdayConfig.name}</p>
          <h1 className="hero-title">
            Feliz
            <br />
            cumpleaños
          </h1>
          <p className="hero-age">
            Hoy cumples <strong>{birthdayConfig.turningAge}</strong> 🎈
          </p>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span>Desliza</span>
          <ChevronDown size={22} />
        </div>
      </section>

      <section className="lines">
        <Reveal>
          <p className="line">Hoy es tu día.</p>
        </Reveal>
        <Reveal delay={150}>
          <p className="line">Y quise hacerte algo especial.</p>
        </Reveal>
        <Reveal delay={300}>
          <p className="line line--accent">Ve bajando… 💌</p>
        </Reveal>
      </section>

      <PhotoPile items={memories} />

      <section className="cake-section">
        <Reveal>
          <h2 className="section-title">Hora del pastel</h2>
        </Reveal>
        <Reveal delay={120}>
          <Cake age={birthdayConfig.turningAge} />
        </Reveal>
      </section>

      <section className="letter-section">
        <Reveal>
          <article className="letter">
            <p className="eyebrow eyebrow--dark">Una carta para ti</p>
            <h2 className="letter-title">{birthdayConfig.name} :)</h2>
            {letterParagraphs.map((paragraph, index) => (
              <Reveal key={paragraph} delay={index * 140}>
                <p className="letter-text">{paragraph}</p>
              </Reveal>
            ))}
            <p className="letter-signature">{birthdayConfig.signature}</p>
          </article>
        </Reveal>
      </section>

      <section className="together-section">
        <Reveal>
          <p className="eyebrow">Nuestro tiempo</p>
          <h2 className="section-title">
            Juntos desde el {birthdayConfig.relationshipStartLabel}
          </h2>
        </Reveal>
        <div className="together-grid">
          {togetherTiles.map((tile, index) => (
            <Reveal key={tile.key} delay={index * 110}>
              <article className="together-tile">
                <span>{together[tile.key]}</span>
                <p>{tile.label}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <SoundtrackSection autoplay />

      <footer className="story-footer">
        <p>Feliz cumpleaños, {birthdayConfig.name} 💖</p>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            fireConfetti({ x: 0.5, y: 0.7, count: 160, spread: 100, power: 1.3 });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Otra vez 🎉
        </button>
      </footer>
    </main>
  );
}

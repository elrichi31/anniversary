"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import Balloons from "@/components/Balloons";
import Cake from "@/components/Cake";
import PhotoPile from "@/components/PhotoPile";
import Reveal from "@/components/Reveal";
import SoundtrackSection from "@/components/SoundtrackSection";
import WordReveal from "@/components/WordReveal";
import { birthdayConfig, letterParagraphs } from "@/data/birthday";
import { memories } from "@/data/memories";
import { fireConfetti } from "@/lib/confetti";

export default function BirthdayStory() {
  const heroRef = useRef<HTMLElement | null>(null);

  // Parallax del inicio: el texto sube y se desvanece al empezar a bajar.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
      heroRef.current?.style.setProperty("--hero-p", progress.toFixed(3));
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

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
    <main className="story story--enter">
      <section ref={heroRef} className="hero">
        <Balloons count={10} />
        <div className="hero-copy">
          <p className="eyebrow">Para {birthdayConfig.name}</p>
          <h1 className="hero-title" aria-label="Feliz cumpleaños">
            <span className="hero-line" aria-hidden="true">
              <span style={{ "--d": "0.25s" } as CSSProperties}>Feliz</span>
            </span>
            <span className="hero-line" aria-hidden="true">
              <span style={{ "--d": "0.5s" } as CSSProperties}>cumpleaños</span>
            </span>
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
        <WordReveal className="line" text="Hoy es tu día." />
        <WordReveal className="line" text="Y quise hacerte algo especial." delay={500} />
        <WordReveal className="line line--accent" text="Ve bajando… 💌" delay={1300} />
      </section>

      <PhotoPile items={memories} />

      <section className="cake-section">
        <Reveal variant="blur">
          <h2 className="section-title">Hora del pastel</h2>
        </Reveal>
        <Cake age={birthdayConfig.turningAge} />
      </section>

      <section className="letter-section">
        <Reveal variant="unfold" className="letter-wrap">
          <article className="letter">
            <p className="eyebrow eyebrow--dark">Una carta para ti</p>
            <h2 className="letter-title">{birthdayConfig.name} :)</h2>
            {letterParagraphs.map((paragraph, index) => (
              <Reveal key={paragraph} delay={500 + index * 350} variant="blur">
                <p className="letter-text">{paragraph}</p>
              </Reveal>
            ))}
            <p className="letter-signature">{birthdayConfig.signature}</p>
          </article>
        </Reveal>
      </section>

      <SoundtrackSection autoplay />

      <footer className="story-footer">
        <p>
          Feliz cumpleaños, {birthdayConfig.name}{" "}
          <span className="heartbeat" aria-hidden="true">
            💖
          </span>
        </p>
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

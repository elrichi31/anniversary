"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import StoryScene from "@/components/StoryScene";
import { memories } from "@/data/memories";

const milestoneDate = new Date(2026, 5, 18, 10, 0, 0);
const relationshipStartDate = new Date("2022-12-18T00:00:00");

const letterDraft = [
  "Holii preciosa, bueno esta carta es un poco diferente a las que generalmente te escribo pero bueno quiero que sepas eres el amor de mi vida y sabes que siempre te voy a amar con todo mi corazon, te pido perdon por todos los problemas que se pueden llegar a dar pero sabes que siempre voy a poner de parte para resolver cualquier cosa, gracias por tenerme tanta paciencia, yo se que aveces mi humor no es el mejor pero te agradezco que siempre estes ahi para mi, gracias por ser tan linda conmigo, por apoyarme en todo lo que hago, por entenderme y por ser la novia mas linda del mundo, me encanta cada cosa de ti y cada dia me enamoro mas de ti, gracias por hacerme tan feliz y por dejarme ser parte de tu vida, te amo mucho mi amor y espero que podamos seguir celebrando muchos meses mas juntos. Felices 42 meses mi amooor 👩🏿‍⚕️😽❤️",
];

const DEV_FORCE_UNLOCK = process.env.NEXT_PUBLIC_FORCE_UNLOCK === "true";

const introPageStyle: CSSProperties = {
  minHeight: "100svh",
  background:
    "radial-gradient(circle at top, rgba(255, 190, 132, 0.16), transparent 30%), radial-gradient(circle at 80% 20%, rgba(145, 176, 255, 0.1), transparent 24%), linear-gradient(180deg, #120c18 0%, #09060f 58%, #08050d 100%)",
};

const introHeroStyle: CSSProperties = {
  position: "relative",
  minHeight: "100svh",
  display: "grid",
  alignContent: "center",
  gap: "1.4rem",
  padding:
    "calc(1.5rem + env(safe-area-inset-top)) 1.1rem calc(1.75rem + env(safe-area-inset-bottom))",
  overflow: "hidden",
  justifyItems: "center",
};

const introCountdownStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "0.7rem",
  width: "min(100%, 52rem)",
  alignItems: "stretch",
};

const introButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  appearance: "none",
  border: 0,
  width: "100%",
  minHeight: "3.75rem",
  padding: "0.95rem 1.25rem",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #f3c79b 0%, #ffb57a 100%)",
  color: "#24150f",
  fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  fontSize: "1rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  boxShadow:
    "0 18px 48px rgba(255, 154, 79, 0.22), inset 0 1px 0 rgba(255, 248, 239, 0.48)",
  cursor: "pointer",
};

function introTileStyle(): CSSProperties {
  return {
    minHeight: "7.5rem",
    padding: "0.9rem 0.95rem",
    border: "1px solid rgba(255, 248, 239, 0.1)",
    borderRadius: "1.35rem",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
    backdropFilter: "blur(16px)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 16px 40px rgba(0, 0, 0, 0.18)",
    display: "grid",
    alignContent: "center",
    justifyItems: "center",
    textAlign: "center",
  };
}

function addMonths(date: Date, monthsToAdd: number) {
  const next = new Date(date);
  const originalDay = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + monthsToAdd);
  const lastDayOfTargetMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();
  next.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return next;
}

function getTogetherParts(now: Date | null) {
  if (!now) {
    return {
      years: "--",
      months: "--",
      days: "--",
      hours: "--",
    };
  }

  if (now.getTime() <= relationshipStartDate.getTime()) {
    return {
      years: "00",
      months: "00",
      days: "00",
      hours: "00",
    };
  }

  let cursor = new Date(relationshipStartDate);
  let years = 0;
  let months = 0;

  while (true) {
    const next = new Date(cursor);
    next.setFullYear(next.getFullYear() + 1);

    if (next.getTime() <= now.getTime()) {
      years += 1;
      cursor = next;
      continue;
    }

    break;
  }

  while (true) {
    const next = addMonths(cursor, 1);

    if (next.getTime() <= now.getTime()) {
      months += 1;
      cursor = next;
      continue;
    }

    break;
  }

  const remainingMs = now.getTime() - cursor.getTime();
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);

  return {
    years: String(years).padStart(2, "0"),
    months: String(months).padStart(2, "0"),
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
  };
}

function getMilestoneCountdownParts(now: Date | null) {
  if (!now) {
    return {
      days: "--",
      hours: "--",
      minutes: "--",
      seconds: "--",
    };
  }

  const remainingMs = Math.max(milestoneDate.getTime() - now.getTime(), 0);
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function isMilestoneReached(now: Date | null) {
  if (!now) {
    return false;
  }

  return milestoneDate.getTime() - now.getTime() <= 0;
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [entered, setEntered] = useState(false);
  const together = getTogetherParts(now);
  const milestoneCountdown = getMilestoneCountdownParts(now);
  const milestoneReached = isMilestoneReached(now);
  const canEnter = DEV_FORCE_UNLOCK || milestoneReached;
  useEffect(() => {
    const tick = () => {
      setNow(new Date());
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (entered) {
      window.scrollTo(0, 0);
    }
  }, [entered]);


  if (!entered) {
    return (
      <main style={introPageStyle}>
        <section style={introHeroStyle}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 14% 18%, rgba(255, 248, 239, 0.92) 0 1px, transparent 1.6px), radial-gradient(circle at 72% 26%, rgba(255, 248, 239, 0.72) 0 1px, transparent 1.8px), radial-gradient(circle at 34% 74%, rgba(255, 248, 239, 0.72) 0 1px, transparent 1.7px), radial-gradient(circle at 84% 66%, rgba(255, 248, 239, 0.92) 0 1px, transparent 1.5px), radial-gradient(circle at 58% 48%, rgba(255, 248, 239, 0.64) 0 1px, transparent 1.8px)",
              backgroundSize: "220px 220px",
              opacity: 0.65,
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "10%",
              right: "-10%",
              width: "11rem",
              height: "11rem",
              borderRadius: "999px",
              background: "rgba(255, 182, 121, 0.22)",
              filter: "blur(18px)",
              opacity: 0.72,
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "16%",
              left: "-12%",
              width: "9rem",
              height: "9rem",
              borderRadius: "999px",
              background: "rgba(155, 189, 255, 0.16)",
              filter: "blur(18px)",
              opacity: 0.72,
              pointerEvents: "none",
            }}
          />

          <div style={introCountdownStyle} aria-live="polite">
            <article style={introTileStyle()}>
              <span
                style={{
                  display: "block",
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "URW Palladio L", Georgia, serif',
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  lineHeight: 0.9,
                }}
              >
                {milestoneCountdown.days}
              </span>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  color: "rgba(255, 248, 239, 0.62)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: "0.7rem",
                }}
              >
                Dias
              </p>
            </article>
            <article style={introTileStyle()}>
              <span
                style={{
                  display: "block",
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "URW Palladio L", Georgia, serif',
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  lineHeight: 0.9,
                }}
              >
                {milestoneCountdown.hours}
              </span>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  color: "rgba(255, 248, 239, 0.62)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: "0.7rem",
                }}
              >
                Horas
              </p>
            </article>
            <article style={introTileStyle()}>
              <span
                style={{
                  display: "block",
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "URW Palladio L", Georgia, serif',
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  lineHeight: 0.9,
                }}
              >
                {milestoneCountdown.minutes}
              </span>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  color: "rgba(255, 248, 239, 0.62)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: "0.7rem",
                }}
              >
                Min
              </p>
            </article>
            <article style={introTileStyle()}>
              <span
                style={{
                  display: "block",
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "URW Palladio L", Georgia, serif',
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  lineHeight: 0.9,
                }}
              >
                {milestoneCountdown.seconds}
              </span>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  color: "rgba(255, 248, 239, 0.62)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: "0.7rem",
                }}
              >
                Seg
              </p>
            </article>
          </div>

          <button
            type="button"
            style={{
              ...introButtonStyle,
              width: "min(100%, 20rem)",
              opacity: canEnter ? 1 : 0.5,
              cursor: canEnter ? "pointer" : "not-allowed",
              filter: canEnter ? "none" : "grayscale(0.2)",
            }}
            onClick={() => {
              if (canEnter) {
                setEntered(true);
              }
            }}
            disabled={!canEnter}
          >
            {canEnter ? "Abrir sorpresa" : "Se abre el 18 de junio a las 10:00 AM"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="story-page">
      <div className="story-scene-layer" aria-hidden="true">
        <StoryScene
          items={memories}
          letterParagraphs={letterDraft}
          signature="Con amor, tu lokitoo 🦅"
          countdown={together}
        />
      </div>

      <section className="story-section story-section--photos" />
      <section className="story-section story-section--spacer" />
      <section className="story-section story-section--spacer" />

    </main>
  );
}

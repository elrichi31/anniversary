"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import StoryScene from "@/components/StoryScene";
import { memories } from "@/data/memories";

const milestoneDate = new Date("2026-06-18T00:00:00");
const relationshipStartDate = new Date("2022-12-18T00:00:00");
const soundtrackSrc = "/soundtrack/our-song.mp3";
const soundtrackCoverSrc = "/soundtrack/cover.jpg";
const soundtrackTitle = "Nuestra cancion";
const soundtrackArtist = "Tu artista aqui";

const letterDraft = [
  "[Escribe aqui como comenzo todo y que fue lo primero que sentiste por ella.]",
  "[Aqui puedes poner una anecdota o un recuerdo que siempre quieras que ella vuelva a leer.]",
  "[Y aqui deja el mensaje final, promesa o dedicatoria que quieres que quede guardada en su pagina.]",
];

const DEV_FORCE_UNLOCK = true;
const introHeadlineWords = ["Falta", "poquito", "para", "nuestro", "cumple", "mes."];

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

const introCopyStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gap: "0.65rem",
  maxWidth: "42rem",
  justifyItems: "center",
  textAlign: "center",
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

function isMilestoneReached(now: Date | null) {
  if (!now) {
    return false;
  }

  return milestoneDate.getTime() - now.getTime() <= 0;
}

function formatClock(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);

  const together = getTogetherParts(now);
  const milestoneReached = isMilestoneReached(now);
  const canEnter = DEV_FORCE_UNLOCK || milestoneReached;
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const onLoadedMetadata = () => {
      setTrackDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setTrackProgress(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setTrackProgress(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [entered]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: string) => {
    const audio = audioRef.current;
    const nextValue = Number(value);

    if (!audio || Number.isNaN(nextValue)) {
      return;
    }

    audio.currentTime = nextValue;
    setTrackProgress(nextValue);
  };

  if (!entered) {
    return (
      <main style={introPageStyle}>
        <style>{`
          @keyframes introWordFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.9;
            }
            50% {
              transform: translate3d(0, -10px, 0);
              opacity: 1;
            }
          }

          @keyframes introWordReveal {
            0% {
              opacity: 0;
              transform: translate3d(0, 22px, 0) scale(0.985);
              filter: blur(8px);
            }
            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
              filter: blur(0);
            }
          }
        `}</style>

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

          <div style={introCopyStyle}>
            <p
              style={{
                margin: 0,
                color: "rgba(255, 217, 182, 0.82)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.72rem",
              }}
            >
              18 de junio
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily:
                  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "URW Palladio L", Georgia, serif',
                fontSize: "clamp(2.5rem, 8vw, 5.4rem)",
                lineHeight: 0.94,
                maxWidth: "11ch",
                textWrap: "balance",
              }}
            >
              {introHeadlineWords.map((word, index) => (
                <span
                  key={word}
                  style={{
                    display: "inline-block",
                    marginRight: index === introHeadlineWords.length - 1 ? 0 : "0.22em",
                    animation:
                      `introWordReveal 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 90}ms both, ` +
                      `introWordFloat ${3.6 + index * 0.18}s ease-in-out ${0.9 + index * 0.08}s infinite`,
                    willChange: "transform, opacity",
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: "24rem",
                color: "rgba(255, 248, 239, 0.72)",
                fontSize: "0.96rem",
                lineHeight: 1.5,
              }}
            >
              Mira cuanto tiempo llevamos juntos. Luego abres tu sorpresa.
            </p>
          </div>

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
                {together.years}
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
                Anos
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
                {together.months}
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
                Meses
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
                {together.days}
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
                {together.hours}
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
            {canEnter ? "Abrir sorpresa" : "Se abre el 18 de junio"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="story-page">
      <audio ref={audioRef} preload="metadata" src={soundtrackSrc} />

      <div className="story-scene-layer" aria-hidden="true">
        <StoryScene
          items={memories}
          letterParagraphs={letterDraft}
          signature="Con amor, tu ingeniero."
          countdown={together}
        />
      </div>

      <section className="story-section story-section--photos" />
      <section className="story-section story-section--spacer" />
      <section className="story-section story-section--spacer" />

      <section className="story-section story-section--soundtrack">
        <div className="soundtrack-wrap">
          <article className="spotify-card">
            <div className="spotify-art">
              <img
                src={soundtrackCoverSrc}
                alt="Portada de la cancion"
                className="spotify-art-image"
              />
            </div>

            <div className="spotify-meta">
              <p className="spotify-kicker">Nuestra cancion</p>
              <h3>{soundtrackTitle}</h3>
              <p className="spotify-artist">{soundtrackArtist}</p>
              <p className="spotify-hint">
                Pon tu mp3 en `public/soundtrack/our-song.mp3` y la portada en
                `public/soundtrack/cover.jpg`
              </p>

              <div className="spotify-controls">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="spotify-play"
                >
                  {isPlaying ? "II" : ">"}
                </button>

                <div className="spotify-progress-shell">
                  <input
                    type="range"
                    min="0"
                    max={trackDuration || 1}
                    step="0.1"
                    value={Math.min(trackProgress, trackDuration || 1)}
                    onChange={(event) => handleSeek(event.target.value)}
                    className="spotify-progress"
                  />

                  <div className="spotify-times">
                    <span>{formatClock(trackProgress)}</span>
                    <span>{formatClock(trackDuration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import StoryScene from "@/components/StoryScene";
import { memories } from "@/data/memories";

const milestoneDate = new Date(2026, 5, 18, 10, 0, 0);
const relationshipStartDate = new Date("2022-12-18T00:00:00");
const soundtrackSrc = "/soundtrack/our-song.mp3";
const soundtrackTitle = "Nuestra cancion";
const soundtrackArtist = "Tu artista aqui";
const spotifyLogoSrc = "/spotify-full-logo-white.png";

type SpotifyTrackMetadata = {
  album: {
    name: string;
    releaseDate: string | null;
    spotifyUrl: string | null;
  };
  artistName: string;
  artists: Array<{
    name: string;
    spotifyUrl: string | null;
  }>;
  configured: true;
  cover: {
    height: number | null;
    url: string;
    width: number | null;
  } | null;
  durationMs: number;
  durationText: string;
  id: string;
  name: string;
  previewUrl: string | null;
  spotifyUrl: string | null;
  uri: string;
};

type SpotifyTrackApiResponse =
  | SpotifyTrackMetadata
  | {
      configured: false;
      error: string;
    }
  | {
      configured: true;
      error: string;
    };

type SpotifyPlaylistTrack = {
  artistName: string;
  cover: {
    height: number | null;
    url: string;
    width: number | null;
  } | null;
  durationMs: number;
  durationText: string;
  id: string | null;
  isLocal: boolean;
  name: string;
  spotifyUrl: string | null;
  uri: string;
};

type SpotifyPlaylistMetadata = {
  configured: true;
  id: string;
  name: string;
  ownerName: string | null;
  spotifyUrl: string | null;
  totalTracks: number;
  tracks: SpotifyPlaylistTrack[];
};

type SpotifyPlaylistApiResponse =
  | SpotifyPlaylistMetadata
  | {
      configured: false;
      error: string;
    }
  | {
      configured: true;
      error: string;
    };

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
  const [volume, setVolume] = useState(0.75);
  const [hasSoundtrackCover, setHasSoundtrackCover] = useState(true);
  const [isSoundtrackVisible, setIsSoundtrackVisible] = useState(false);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrackMetadata | null>(null);
  const [spotifyPlaylist, setSpotifyPlaylist] =
    useState<SpotifyPlaylistMetadata | null>(null);

  const together = getTogetherParts(now);
  const milestoneCountdown = getMilestoneCountdownParts(now);
  const milestoneReached = isMilestoneReached(now);
  const canEnter = DEV_FORCE_UNLOCK || milestoneReached;
  const displayedSoundtrackArtist = spotifyTrack?.artistName || soundtrackArtist;
  const displayedSoundtrackCover = spotifyTrack?.cover?.url ?? null;
  const displayedSoundtrackTitle = spotifyTrack?.name || soundtrackTitle;
  const displayedTrackDurationLabel =
    spotifyTrack?.durationText || formatClock(trackDuration);
  const displayedPlaylistTracks = spotifyPlaylist?.tracks.length
    ? spotifyPlaylist.tracks
    : [
        {
          artistName: displayedSoundtrackArtist,
          cover: displayedSoundtrackCover
            ? {
                height: null,
                url: displayedSoundtrackCover,
                width: null,
              }
            : null,
          durationMs: spotifyTrack?.durationMs ?? trackDuration * 1000,
          durationText: displayedTrackDurationLabel,
          id: spotifyTrack?.id ?? null,
          isLocal: false,
          name: displayedSoundtrackTitle,
          spotifyUrl: spotifyTrack?.spotifyUrl ?? null,
          uri: spotifyTrack?.uri ?? "",
        },
      ];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoplayOnEnterRef = useRef(false);
  const soundtrackSectionRef = useRef<HTMLElement | null>(null);

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
    if (!entered || spotifyTrack) {
      return;
    }

    let isMounted = true;

    fetch("/api/spotify/track")
      .then(async (response) => {
        const data = (await response.json()) as SpotifyTrackApiResponse;

        if (!isMounted || !response.ok || !data.configured || "error" in data) {
          if ("error" in data) {
            console.info("Spotify metadata fallback:", data.error);
          }
          return;
        }

        setSpotifyTrack(data);
        setHasSoundtrackCover(Boolean(data.cover?.url));
      })
      .catch(() => {
        // Keep local fallback metadata when Spotify is not configured or unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [entered, spotifyTrack]);

  useEffect(() => {
    if (!entered || spotifyPlaylist) {
      return;
    }

    let isMounted = true;

    fetch("/api/spotify/playlist")
      .then(async (response) => {
        const data = (await response.json()) as SpotifyPlaylistApiResponse;

        if (!isMounted || !response.ok || !data.configured || "error" in data) {
          if ("error" in data) {
            console.info("Spotify playlist fallback:", data.error);
          }
          return;
        }

        setSpotifyPlaylist(data);
      })
      .catch(() => {
        // Keep the hand-written queue when Spotify playlist metadata is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [entered, spotifyPlaylist]);

  useEffect(() => {
    if (!entered) {
      return;
    }

    const updateSoundtrackVisibility = () => {
      const section = soundtrackSectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const revealLine = window.innerHeight * 0.28;
      const hideLine = window.innerHeight * 0.55;

      setIsSoundtrackVisible((current) =>
        current ? rect.top < hideLine : rect.top < revealLine,
      );
    };

    updateSoundtrackVisibility();
    window.addEventListener("scroll", updateSoundtrackVisibility, { passive: true });
    window.addEventListener("resize", updateSoundtrackVisibility);

    return () => {
      window.removeEventListener("scroll", updateSoundtrackVisibility);
      window.removeEventListener("resize", updateSoundtrackVisibility);
    };
  }, [entered]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [entered, volume]);

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

  useEffect(() => {
    if (!entered || !shouldAutoplayOnEnterRef.current) {
      return;
    }

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    shouldAutoplayOnEnterRef.current = false;
    audio.volume = volume;

    const playTimer = window.setTimeout(() => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }, 180);

    return () => window.clearTimeout(playTimer);
  }, [entered, volume]);

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

  const handleVolumeChange = (value: string) => {
    const nextValue = Number(value);

    if (Number.isNaN(nextValue)) {
      return;
    }

    setVolume(Math.min(Math.max(nextValue, 0), 1));
  };

  const trackProgressPercent =
    trackDuration > 0 ? Math.min((trackProgress / trackDuration) * 100, 100) : 0;

  const spotifyProgressStyle = {
    "--spotify-progress": `${trackProgressPercent}%`,
  } as CSSProperties;

  const spotifyVolumeStyle = {
    "--spotify-volume": `${volume * 100}%`,
  } as CSSProperties;

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
                shouldAutoplayOnEnterRef.current = true;
                setEntered(true);
              }
            }}
            disabled={!canEnter}
          >
            {canEnter ? "Abrir sorpresa" : "Se abre el 18 de junio a las 6:00 PM"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="story-page">
      <audio ref={audioRef} preload="auto" src={soundtrackSrc} />

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

      <section
        ref={soundtrackSectionRef}
        className="story-section story-section--soundtrack"
      >
        <div className="soundtrack-wrap">
          <article
            className={`spotify-card ${
              isSoundtrackVisible ? "spotify-card--visible" : ""
            }`}
            aria-label="Reproductor de Spotify"
          >
            <div className="spotify-window-bar" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <header className="spotify-header">
              <Image
                src={spotifyLogoSrc}
                alt="Spotify"
                width={167}
                height={50}
                className="spotify-logo"
              />
            </header>

            <div className="spotify-player">
              <div className="spotify-art-column">
                <div className="spotify-art">
                  {hasSoundtrackCover && displayedSoundtrackCover ? (
                    <Image
                      src={displayedSoundtrackCover}
                      alt="Portada de la cancion"
                      width={640}
                      height={640}
                      className="spotify-art-image"
                      onError={() => setHasSoundtrackCover(false)}
                    />
                  ) : (
                    <div className="spotify-art-fallback" aria-hidden="true">
                      <span>{displayedSoundtrackTitle.slice(0, 1)}</span>
                    </div>
                  )}
                </div>

                <div className="spotify-volume" style={spotifyVolumeStyle}>
                  <span
                    className="spotify-volume-icon"
                    aria-hidden="true"
                  >
                    {volume === 0 ? (
                      <VolumeX size={18} strokeWidth={2.6} />
                    ) : (
                      <Volume2 size={18} strokeWidth={2.6} />
                    )}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(event) => handleVolumeChange(event.target.value)}
                    className="spotify-volume-slider"
                    aria-label="Volumen de la cancion"
                  />
                  <span className="spotify-volume-value">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              <div className="spotify-meta">
                <p className="spotify-kicker">Now playing</p>
                <h3>{displayedSoundtrackTitle}</h3>
                <p className="spotify-artist">{displayedSoundtrackArtist}</p>

                {spotifyTrack?.spotifyUrl ? (
                  <a
                    className="spotify-track-link"
                    href={spotifyTrack.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir en Spotify
                  </a>
                ) : null}

                <div className="spotify-controls">
                  <button
                    type="button"
                    className="spotify-icon-button"
                    aria-label="Cancion anterior"
                    disabled
                  >
                    <SkipBack aria-hidden="true" size={28} strokeWidth={2.8} />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="spotify-play"
                    aria-label={isPlaying ? "Pausar cancion" : "Reproducir cancion"}
                  >
                    {isPlaying ? (
                      <Pause
                        aria-hidden="true"
                        className="spotify-play-icon"
                        size={30}
                        strokeWidth={3}
                      />
                    ) : (
                      <Play
                        aria-hidden="true"
                        className="spotify-play-icon spotify-play-icon--play"
                        size={30}
                        strokeWidth={3}
                        fill="currentColor"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    className="spotify-icon-button"
                    aria-label="Cancion siguiente"
                    disabled
                  >
                    <SkipForward aria-hidden="true" size={28} strokeWidth={2.8} />
                  </button>
                </div>

                <div className="spotify-progress-shell" style={spotifyProgressStyle}>
                  <input
                    type="range"
                    min="0"
                    max={trackDuration || 1}
                    step="0.1"
                    value={Math.min(trackProgress, trackDuration || 1)}
                    onChange={(event) => handleSeek(event.target.value)}
                    className="spotify-progress"
                    aria-label="Progreso de la cancion"
                  />

                  <div className="spotify-times">
                    <span>{formatClock(trackProgress)}</span>
                    <span>{displayedTrackDurationLabel}</span>
                  </div>
                </div>

              </div>
            </div>

            <aside className="spotify-queue" aria-label="Cola de canciones">
              <div className="spotify-queue-heading">
                <p className="spotify-queue-title">
                  {spotifyPlaylist?.name || "Playlist"}
                </p>
                {spotifyPlaylist ? (
                  <span>{spotifyPlaylist.totalTracks} canciones</span>
                ) : null}
              </div>

              <div className="spotify-queue-list">
                {displayedPlaylistTracks.map((track, index) => (
                  <div
                    className={`spotify-queue-track ${
                      index === 0 ? "spotify-queue-track--active" : ""
                    }`}
                    key={track.id || `${track.name}-${index}`}
                  >
                    <span className="spotify-queue-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="spotify-queue-cover" aria-hidden="true">
                      {track.cover ? (
                        <Image
                          src={track.cover.url}
                          alt=""
                          width={48}
                          height={48}
                        />
                      ) : (
                        <span />
                      )}
                    </span>
                    <div>
                      <strong>{track.name}</strong>
                      <span>{track.artistName || "Spotify"}</span>
                    </div>
                    <span className="spotify-queue-duration">
                      {track.durationText}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

          </article>
        </div>
      </section>
    </main>
  );
}

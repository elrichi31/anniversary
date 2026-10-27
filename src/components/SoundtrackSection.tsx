"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

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

function formatClock(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}


type SoundtrackSectionProps = {
  autoplay: boolean;
};

export default function SoundtrackSection({ autoplay }: SoundtrackSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [hasSoundtrackCover, setHasSoundtrackCover] = useState(true);
  const [isSoundtrackVisible, setIsSoundtrackVisible] = useState(false);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrackMetadata | null>(null);
  const [spotifyPlaylist, setSpotifyPlaylist] =
    useState<SpotifyPlaylistMetadata | null>(null);

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
  const shouldAutoplayOnEnterRef = useRef(autoplay);
  const soundtrackSectionRef = useRef<HTMLElement | null>(null);


  useEffect(() => {
    if (spotifyTrack) {
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
  }, [spotifyTrack]);

  useEffect(() => {
    if (spotifyPlaylist) {
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
  }, [spotifyPlaylist]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

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
  }, []);

  useEffect(() => {
    if (!shouldAutoplayOnEnterRef.current) {
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
  }, [volume]);

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

  return (
    <>
      <audio ref={audioRef} preload="auto" src={soundtrackSrc} />

      <section
        ref={soundtrackSectionRef}
            className="soundtrack-section"
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
    </>
  );
}

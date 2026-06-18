import { NextResponse } from "next/server";
import {
  extractSpotifyResourceId,
  formatSpotifyDuration,
  getSpotifyAccessToken,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SpotifyImage = {
  height: number | null;
  url: string;
  width: number | null;
};

type SpotifyTrackResponse = {
  album: {
    external_urls?: {
      spotify?: string;
    };
    images: SpotifyImage[];
    name: string;
    release_date?: string;
  };
  artists: Array<{
    external_urls?: {
      spotify?: string;
    };
    name: string;
  }>;
  duration_ms: number;
  external_urls?: {
    spotify?: string;
  };
  id: string;
  name: string;
  preview_url: string | null;
  uri: string;
};

export async function GET() {
  const trackId = extractSpotifyResourceId(
    process.env.SPOTIFY_TRACK_ID ||
      process.env.SPOTIFY_TRACK_URI ||
      process.env.SPOTIFY_TRACK_URL ||
      "",
    "track",
  );

  if (!trackId) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Set SPOTIFY_TRACK_ID or SPOTIFY_TRACK_URI to load Spotify metadata.",
      },
      { status: 200 },
    );
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const market = process.env.SPOTIFY_MARKET || "US";
    const trackUrl = new URL(`https://api.spotify.com/v1/tracks/${trackId}`);
    trackUrl.searchParams.set("market", market);

    const response = await fetch(trackUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          configured: true,
          error:
            response.status === 404
              ? "Spotify could not find that track. Check SPOTIFY_TRACK_ID, SPOTIFY_TRACK_URI, or SPOTIFY_TRACK_URL."
              : `Spotify track request failed with ${response.status}`,
          upstreamStatus: response.status,
        },
        { status: 200 },
      );
    }

    const track = (await response.json()) as SpotifyTrackResponse;
    const cover = track.album.images[0] ?? null;

    return NextResponse.json({
      configured: true,
      album: {
        name: track.album.name,
        releaseDate: track.album.release_date ?? null,
        spotifyUrl: track.album.external_urls?.spotify ?? null,
      },
      artists: track.artists.map((artist) => ({
        name: artist.name,
        spotifyUrl: artist.external_urls?.spotify ?? null,
      })),
      artistName: track.artists.map((artist) => artist.name).join(", "),
      cover,
      durationMs: track.duration_ms,
      durationText: formatSpotifyDuration(track.duration_ms),
      id: track.id,
      name: track.name,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls?.spotify ?? null,
      uri: track.uri,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        error: error instanceof Error ? error.message : "Unknown Spotify error",
      },
      { status: 500 },
    );
  }
}

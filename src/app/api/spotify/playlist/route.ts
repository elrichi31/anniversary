import { NextResponse } from "next/server";
import {
  extractSpotifyResourceId,
  formatSpotifyDuration,
  getSpotifyAccessToken,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fallbackPlaylistUrl =
  "https://open.spotify.com/playlist/0VBek6AtJvxsiCr1bP237F?si=3f3eaa52d21a4a67";

type SpotifyPlaylistTrack = {
  album?: {
    images: Array<{
      height: number | null;
      url: string;
      width: number | null;
    }>;
  };
  duration_ms: number;
  external_urls?: {
    spotify?: string;
  };
  id: string | null;
  is_local?: boolean;
  name: string;
  type: string;
  uri: string;
  artists: Array<{
    name: string;
  }>;
};

type SpotifyPlaylistResponse = {
  external_urls?: {
    spotify?: string;
  };
  id: string;
  name: string;
  owner: {
    display_name: string | null;
  };
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyPlaylistTrack | null;
    }>;
  };
};

export async function GET() {
  const playlistId = extractSpotifyResourceId(
    process.env.SPOTIFY_PLAYLIST_ID ||
      process.env.SPOTIFY_PLAYLIST_URI ||
      process.env.SPOTIFY_PLAYLIST_URL ||
      fallbackPlaylistUrl,
    "playlist",
  );

  if (!playlistId) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Set SPOTIFY_PLAYLIST_ID, SPOTIFY_PLAYLIST_URI, or SPOTIFY_PLAYLIST_URL to load playlist metadata.",
      },
      { status: 200 },
    );
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const market = process.env.SPOTIFY_MARKET || "US";
    const playlistUrl = new URL(`https://api.spotify.com/v1/playlists/${playlistId}`);
    playlistUrl.searchParams.set("market", market);
    playlistUrl.searchParams.set("limit", "100");
    playlistUrl.searchParams.set(
      "fields",
      "id,name,external_urls,owner(display_name),tracks(total,items(track(id,name,type,uri,is_local,duration_ms,external_urls,album(images),artists(name))))",
    );

    const response = await fetch(playlistUrl, {
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
              ? "Spotify could not find that playlist. Check SPOTIFY_PLAYLIST_ID, SPOTIFY_PLAYLIST_URI, or SPOTIFY_PLAYLIST_URL."
              : `Spotify playlist request failed with ${response.status}`,
          upstreamStatus: response.status,
        },
        { status: 200 },
      );
    }

    const playlist = (await response.json()) as SpotifyPlaylistResponse;
    const tracks = playlist.tracks.items
      .map((item) => item.track)
      .filter(
        (track): track is SpotifyPlaylistTrack =>
          Boolean(track) && track?.type === "track",
      )
      .map((track) => ({
        artistName: track.artists.map((artist) => artist.name).join(", "),
        cover: track.album?.images[track.album.images.length - 1] ?? null,
        durationMs: track.duration_ms,
        durationText: formatSpotifyDuration(track.duration_ms),
        id: track.id,
        isLocal: Boolean(track.is_local),
        name: track.name,
        spotifyUrl: track.external_urls?.spotify ?? null,
        uri: track.uri,
      }));

    return NextResponse.json({
      configured: true,
      id: playlist.id,
      name: playlist.name,
      ownerName: playlist.owner.display_name,
      spotifyUrl: playlist.external_urls?.spotify ?? null,
      totalTracks: playlist.tracks.total,
      tracks,
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

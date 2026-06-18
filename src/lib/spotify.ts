type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

export function extractSpotifyResourceId(value: string, resourceType: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const uriMatch = trimmed.match(new RegExp(`^spotify:${resourceType}:([A-Za-z0-9]+)$`));
  if (uriMatch) {
    return uriMatch[1];
  }

  try {
    const url = new URL(trimmed);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const resourceSegmentIndex = pathParts.findIndex((part) => part === resourceType);

    if (resourceSegmentIndex >= 0 && pathParts[resourceSegmentIndex + 1]) {
      return pathParts[resourceSegmentIndex + 1];
    }
  } catch {
    // Not a URL, so keep treating it like a raw Spotify id.
  }

  return trimmed;
}

export function formatSpotifyDuration(durationMs: number) {
  const totalSeconds = Math.max(Math.floor(durationMs / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export async function getSpotifyAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30000) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}`);
  }

  const token = (await response.json()) as SpotifyTokenResponse;

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

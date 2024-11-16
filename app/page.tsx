import { MusicAppComponent } from "@/components/music-app";
import { headers } from "next/headers";

interface SpotifyArtist {
  href: string;
  id: string;
  name: string;
  type: string;
}

interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface SpotifyAlbumItems {
  album_type: "album" | "ep" | "single";
  artists: SpotifyArtist[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  total_tracks: number;
  type: "album";
}

interface SpotifyAlbums {
  albums: {
    items: SpotifyAlbumItems[];
  };
}

interface AppleTrack {
  id: string;
  type: string;
  href: string;
  attributes: {
    name: string;
    artistName: string;
    artwork: {
      url: string;
      height: number;
      width: number;
    };
    url: string;
    previews: Array<{ url: string }>;
  };
}

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json();
  return data.access_token;
}

async function getAlbums() {
  const accessToken = await getAccessToken();

  const response = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=50&offset=0",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  );

  const data = (await response.json()) as SpotifyAlbums;
  return data.albums.items;
}

async function getAppleCharts() {
  try {
    // Get country code from request headers
    const headersList = headers();
    const countryCode =
      headersList.get("x-vercel-ip-country")?.toLowerCase() || "us";

    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/${countryCode}/charts?types=songs&limit=25`,
      {
        headers: {
          Authorization: `Bearer ${process.env.APPLE_MUSIC_TOKEN}`,
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Apple Music charts");
    }

    const data = await response.json();

    // Extract the top songs from the response
    const tracks = data.results.songs[0].data.map((track: AppleTrack) => ({
      title: track.attributes.name,
      subtitle: track.attributes.artistName,
      shareLink: track.attributes.url,
      images: {
        background: track.attributes.artwork.url
          .replace("{w}", "800")
          .replace("{h}", "800"),
        coverart: track.attributes.artwork.url
          .replace("{w}", "300")
          .replace("{h}", "300"),
      },
      preview: track.attributes.previews[0]?.url,
    }));

    return {
      tracks,
      countryCode: countryCode.toUpperCase(),
    };
  } catch (error) {
    console.error("Error fetching Apple Music charts:", error);
    return {
      tracks: [],
      countryCode: "US",
    };
  }
}

export default async function Albums() {
  const [albums, appleCharts] = await Promise.all([
    getAlbums(),
    getAppleCharts(),
  ]);

  console.log({ appleCharts });

  return <MusicAppComponent albums={albums} />;
}

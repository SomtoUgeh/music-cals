import { MusicAppComponent } from "@/components/music-app";

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

export default async function Albums() {
  const albums = await getAlbums();

  return <MusicAppComponent albums={albums} />;
}

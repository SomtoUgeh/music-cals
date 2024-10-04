import { MusicAppComponent } from "@/components/music-app";
import { parseDate } from "@/lib/utils";

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json();
  return data.access_token;
}

async function getAlbumsByDate(date: Date) {
  const accessToken = await getAccessToken();
  const formattedDate = date.toISOString().split("T")[0];

  const response = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=20&offset=0`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  );

  const data = await response.json();
  // Filter albums by release date
  return data.albums.items.filter(
    (album) => album.release_date === formattedDate
  );
}

export default async function Albums({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date ? parseDate(searchParams.date) : new Date();
  const albums = await getAlbumsByDate(date);

  return <MusicAppComponent initialDate={date} albums={albums} />;
}

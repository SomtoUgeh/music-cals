import { NextResponse } from "next/server";
import { headers } from "next/headers";

const RAPID_API_KEY = process.env.RAPID_API_KEY as string;
const RAPID_API_HOST = process.env.RAPID_API_HOST as string;
const IP_API_KEY = process.env.IP_API_KEY as string;

interface Country {
  id: string;
  listid: string;
  name: string;
}

interface Track {
  title: string;
  subtitle: string;
  share: {
    href: string;
  };
  images: unknown;
}

async function getCountryFromIP(): Promise<string> {
  try {
    const response = await fetch(
      `https://api.ipapi.com/api/check?access_key=${IP_API_KEY}`
    );
    const data = await response.json();
    return data.country_code;
  } catch (error) {
    console.error("Error fetching country from IP:", error);
    return "DE"; // Fallback to Germany if country lookup fails
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userCountryCode = searchParams.get("countryCode");

  try {
    if (!RAPID_API_KEY || !RAPID_API_HOST) {
      return NextResponse.json(
        { error: "API configuration missing" },
        { status: 500 }
      );
    }

    // Get country code from request headers
    const headersList = headers();
    let countryCode =
      userCountryCode ||
      headersList.get("x-vercel-ip-country") ||
      headersList.get("cf-ipcountry") ||
      (await getCountryFromIP());

    const chartsResponse = await fetch(
      `https://${RAPID_API_HOST}/charts/list`,
      {
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": RAPID_API_HOST,
        },
      }
    );

    if (!chartsResponse.ok) {
      throw new Error("Failed to fetch charts list");
    }

    const chartsData = await chartsResponse.json();

    console.log({ chartsData });

    const countryChart = chartsData.countries.find(
      (country: Country) => country.id === countryCode
    );

    if (!countryChart) {
      console.warn(
        `Country chart not found for ${countryCode}, falling back to Germany`
      );

      countryCode = "DE";
    }

    // Fetch the top tracks for the country
    const tracksResponse = await fetch(
      `https://${RAPID_API_HOST}/charts/track?locale=en-US&pageSize=100&startFrom=0&countryCode=${countryCode}`,
      {
        headers: {
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": RAPID_API_HOST,
        },
      }
    );

    if (!tracksResponse.ok) {
      throw new Error("Failed to fetch top tracks");
    }

    const tracksData = await tracksResponse.json();

    console.log({ tracksData });

    const tracks = tracksData.tracks.map((track: Track) => ({
      title: track.title,
      subtitle: track.subtitle,
      shareLink: track.share.href,
      images: track.images,
    }));

    return NextResponse.json({ tracks, countryCode });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "An error occurred while fetching top tracks." },
      { status: 500 }
    );
  }
}

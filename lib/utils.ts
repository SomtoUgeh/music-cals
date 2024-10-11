import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, isSameDay } from "date-fns";
import type { SpotifyAlbumItems } from "@/app/page";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateForURL(date: Date): string {
  return format(date, "dd-MMM-yyyy");
}

export function parseDate(dateString: string): Date {
  const currentDate = dateString || format(new Date(), "dd-MMM-yyyy");

  return parse(currentDate, "dd-MMM-yyyy", new Date());
}

export function filterAlbumsByDate(
  albums: SpotifyAlbumItems[],
  date: Date
): SpotifyAlbumItems[] {
  return albums.filter((album) => {
    const releaseDate = parse(album.release_date, "yyyy-MM-dd", new Date());

    return isSameDay(releaseDate, date);
  });
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateForURL(date: Date): string {
  return format(date, "dd-MMM-yyyy");
}

export function parseDate(dateString: string): Date {
  return parse(dateString, "dd-MMM-yyyy", new Date());
}

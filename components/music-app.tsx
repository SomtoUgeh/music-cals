"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { filterAlbumsByDate, formatDateForURL, parseDate } from "@/lib/utils";
import type { SpotifyAlbumItems } from "@/app/page";
import Image from "next/image";

interface MusicAppProps {
  albums: SpotifyAlbumItems[];
}

export function MusicAppComponent({ albums }: MusicAppProps) {
  const searchParams = useSearchParams();
  const paramsDate = searchParams.get("date") ?? "";
  const updatedDate = parseDate(paramsDate);
  const filteredAlbumsByDate = filterAlbumsByDate(albums, updatedDate);

  console.log({ filteredAlbumsByDate, albums });

  const [date, setDate] = useQueryState("date", {
    parse: (value: string) => new Date(value),
    serialize: (date: Date) => formatDateForURL(date),
  });
  const [searchQuery, setSearchQuery] = useQueryState("search");
  const [albumType, setAlbumType] = useQueryState("type");

  const [currentMonth, setCurrentMonth] = useState(date);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAlbums = filteredAlbumsByDate.filter((album) => {
    const matchesSearch =
      searchQuery === null ||
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artists.some((artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType =
      albumType === null ||
      albumType === "all" ||
      album.album_type.toLowerCase() === albumType.toLowerCase();

    return matchesSearch && matchesType;
  });

  const itemsPerPage = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlbums.length / itemsPerPage)
  );
  const adjustedCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) setDate(newDate);
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <h3 className="text-2xl font-semibold mb-4">No albums found</h3>
      <p className="text-gray-600 mb-6">
        Try adjusting your search or filters to find more results.
      </p>
      <Button
        onClick={() => {
          setSearchQuery(null);
          setAlbumType(null);
          setDate(new Date());
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Music Date</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search albums..."
            className="w-64"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[1fr,2fr] gap-8">
        <div className="mb-8 lg:mb-0">
          <div className="w-full">
            <Calendar
              selected={date ? date : undefined}
              onSelect={handleDateChange}
              month={currentMonth ? currentMonth : undefined}
              onMonthChange={handleMonthChange}
              disableFutureDates
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl font-bold mb-4">
                {date ? format(date, "d MMMM yyyy") : "Select a date"}
              </h2>
            </div>

            <div className="flex flex-wrap justify-end gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Type: {albumType ? albumType : "Album Type"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["All", "Single", "EP", "Album"].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={albumType === type}
                      onCheckedChange={() => setAlbumType(type.toLowerCase())}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredAlbums.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <Image
                      src={album.images[0]?.url}
                      alt={album.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover"
                    />

                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {album.name}
                      </h3>
                      <p className="text-gray-600">
                        {album.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAlbums.length > itemsPerPage && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="mx-4 flex items-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            renderEmptyState()
          )}
        </div>
      </div>
    </div>
  );
}

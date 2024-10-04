"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { formatDateForURL } from "@/lib/utils";

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

interface MusicAppComponentProps {
  initialDate: Date;
  albums: Album[];
}

export function MusicAppComponent({
  initialDate,
  albums,
}: MusicAppComponentProps) {
  const router = useRouter();
  const [date, setDate] = useQueryState("date", {
    parse: (value: string) => new Date(value),
    serialize: (date: Date) => formatDateForURL(date),
  });

  const [currentMonth, setCurrentMonth] = useState(date);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "All",
    genre: "All",
    popularity: "All",
  });

  useEffect(() => {
    setCurrentMonth(date);
  }, [date]);

  const filteredAlbums = albums.filter(
    (album) =>
      album.name.toLowerCase().includes(search.toLowerCase()) ||
      album.artists.some((artist) =>
        artist.name.toLowerCase().includes(search.toLowerCase())
      )
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      router.push(`?date=${formatDateForURL(newDate)}`, { scroll: false });
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  // If you need to set an initial value, you can do it after the hook:
  useEffect(() => {
    if (!date) {
      setDate(initialDate);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">logo</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search albums..."
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <img
            src="/placeholder.svg"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
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
                    Type: {filters.type}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["All", "Single", "EP", "Album"].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={filters.type === type}
                      onCheckedChange={() => setFilters({ ...filters, type })}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Genre: {filters.genre}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["All", "Pop", "Rock", "Hip-Hop", "Electronic"].map(
                    (genre) => (
                      <DropdownMenuCheckboxItem
                        key={genre}
                        checked={filters.genre === genre}
                        onCheckedChange={() =>
                          setFilters({ ...filters, genre })
                        }
                      >
                        {genre}
                      </DropdownMenuCheckboxItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Popularity: {filters.popularity}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["All", "High", "Medium", "Low"].map((popularity) => (
                    <DropdownMenuCheckboxItem
                      key={popularity}
                      checked={filters.popularity === popularity}
                      onCheckedChange={() =>
                        setFilters({ ...filters, popularity })
                      }
                    >
                      {popularity}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={album.images[0]?.url || "/placeholder.svg"}
                  alt={album.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{album.name}</h3>
                  <p className="text-gray-600">
                    {album.artists.map((artist) => artist.name).join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
        </div>
      </div>
    </div>
  );
}

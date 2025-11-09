"use client";
import { Search } from "lucide-react";

type Props = {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
};

export default function ScheduleToolbar({ searchQuery = "", onSearchChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>
      {/* Day/Week/Month view toggle removed per design — kept toolbar compact */}
    </div>
  );
}

"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    // You can later implement actual search logic or navigation
    console.log("Searching for:", query);
  };

  return (
    <div className="bg-white border-2 rounded shadow flex items-center p-2 max-w-xl">
      <Search className="text-gray-400 ml-2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Jobs with Job categories like marketing ..."
        className="flex-1 w-[100px] p-2 outline-none text-sm text-gray-700"
      />
      <button
        onClick={handleSearch}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
      >
        SEARCH
      </button>
    </div>
  );
}

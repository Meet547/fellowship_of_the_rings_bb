"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SearchResponse } from "./api-types";

interface SearchState {
  /** The raw text query the user typed before navigating to the search screen. */
  textQuery: string;
  setTextQuery: (q: string) => void;
  /** The full response from the last successful /search call (null if none yet). */
  searchResults: SearchResponse | null;
  setSearchResults: (r: SearchResponse | null) => void;
  /** User-facing error message if the last search failed (null if none). */
  searchError: string | null;
  setSearchError: (e: string | null) => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [textQuery, setTextQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  return (
    <SearchContext.Provider
      value={{
        textQuery,
        setTextQuery,
        searchResults,
        setSearchResults,
        searchError,
        setSearchError,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}

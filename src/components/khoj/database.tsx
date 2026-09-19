"use client";

import { motion } from "framer-motion";
import { LayoutGrid, List, Minus, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Btn, SelectInput, useToast } from "./ui";
import { IndiaMap, CITY, type MapDot } from "./india-map";
import { ApiError, getFoundReports } from "@/lib/khoj/api";
import type { MatchCandidate } from "@/lib/khoj/api-types";

// ─── Filters ──────────────────────────────────────────────────────────────────

const FILTERS = [
  { label: "State", options: ["All States", "Maharashtra", "Delhi", "Bihar", "West Bengal"] },
  { label: "Age", options: ["Any Age", "0-12", "13-25", "26-60", "60+"] },
  { label: "Gender", options: ["Any", "Male", "Female", "Other"] },
  { label: "Date Missing", options: ["Any", "Last 7 days", "Last 30 days", "This year"] },
  { label: "Status", options: ["All", "Missing", "Found"] },
];

const AGE_BUCKETS: Record<string, [number, number]> = {
  "0-12": [0, 12],
  "13-25": [13, 25],
  "26-60": [26, 60],
  "60+": [60, Infinity],
};

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** Parse "Approx. 40-60 years" into a [min, max] range. */
function parseAgeRange(age: string): [number, number] | null {
  const nums = (age.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return null;
  return nums.length === 1 ? [nums[0], nums[0]] : [nums[0], nums[1]];
}

/** True when the record's age range overlaps the selected bucket; unset/default passes. */
function matchesAgeFilter(item: MatchCandidate, selected: string | undefined): boolean {
  if (!selected || selected === "Any Age") return true;
  const bucket = AGE_BUCKETS[selected];
  const raw = item.age_range
    ? item.age_range.join("-")
    : typeof item.age === "number"
      ? String(item.age)
      : item.age;
  if (!bucket || typeof raw !== "string") return false;
  const range = parseAgeRange(raw);
  if (!range) return false;
  return range[1] >= bucket[0] && range[0] <= bucket[1];
}

/** Parse "12 Aug 2025" out of the record's date string. */
function parseRecordDate(text: string): Date | null {
  const m = text.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS[m[2]];
  if (month === undefined) return null;
  return new Date(Number(m[3]), month, Number(m[1]));
}

/** True when the record's date falls in the selected window; unset/default passes. */
function matchesDateFilter(item: MatchCandidate, selected: string | undefined): boolean {
  if (!selected || selected === "Any") return true;
  const raw = item.date_found;
  if (typeof raw !== "string") return false;
  const recordDate = parseRecordDate(raw);
  if (!recordDate) return false;
  const now = new Date();
  if (selected === "This year") return recordDate.getFullYear() === now.getFullYear();
  const days = (now.getTime() - recordDate.getTime()) / 86_400_000;
  return days >= 0 && days <= (selected === "Last 7 days" ? 7 : 30);
}

/** Filter predicate shared by the record list and the map dots. */
function filterItem(item: MatchCandidate, filters: Record<string, string>): boolean {
  const state = filters.State;
  const gender = filters.Gender;
  const status = filters.Status;
  return (
    (!state || state === "All States" ||
      [item.location, item.district, item.state]
        .filter((v): v is string => typeof v === "string")
        .some((v) => v.includes(state))) &&
    (!gender || gender === "Any" ||
      item.gender?.toLowerCase() === gender.toLowerCase()) &&
    (!status || status === "All" || status.toLowerCase() === "found") &&
    matchesAgeFilter(item, filters.Age) &&
    matchesDateFilter(item, filters["Date Missing"])
  );
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/** Record label: name, or an honest fallback when the API omits it. */
function displayName(item: MatchCandidate): string {
  const name = typeof item.name === "string" ? item.name.trim() : "";
  return name || "Unnamed record";
}

/** Age label: the record's own age string, else its server-provided age_range. */
function displayAge(item: MatchCandidate): string | null {
  if (typeof item.age === "number") return `${item.age} yrs`;
  if (typeof item.age === "string" && item.age.trim() && item.age.toLowerCase() !== "unknown") {
    return item.age.trim();
  }
  if (Array.isArray(item.age_range)) {
    const [min, max] = item.age_range;
    return min === max ? `~${min} yrs` : `~${min}-${max} yrs`;
  }
  return null;
}

/** First photo URL when the record has one. */
function displayPhoto(item: MatchCandidate): string | null {
  const first = item.photo_urls?.[0];
  return typeof first === "string" && first.trim() ? first : null;
}

/** Date label: the record's own date_found, or null. */
function displayDate(item: MatchCandidate): string | null {
  return typeof item.date_found === "string" && item.date_found.trim()
    ? item.date_found.trim()
    : null;
}

// ─── Map data ─────────────────────────────────────────────────────────────────

/**
 * Map dots come only from real API records that mention one of the few cities
 * the map anchors. Records that resolve to no anchored city are simply not
 * drawn — no coordinates are invented.
 */
const CITY_MATCHERS: ReadonlyArray<readonly [match: string, city: keyof typeof CITY]> = [
  ["mumbai", "mumbai"],
  ["delhi", "delhi"],
  ["patna", "patna"],
  ["kolkata", "kolkata"],
];

function resolveCity(item: MatchCandidate): keyof typeof CITY | null {
  const parts = [item.location, item.district, item.state]
    .filter((v): v is string => typeof v === "string");
  for (const part of parts) {
    const s = part.toLowerCase();
    for (const [match, city] of CITY_MATCHERS) {
      if (s.includes(match)) return city;
    }
  }
  return null;
}

/** Neutral visual weight for the dot, derived from the record's own age when present. */
function levelFor(item: MatchCandidate): "high" | "medium" | "low" {
  const raw = item.age_range
    ? item.age_range.join("-")
    : typeof item.age === "number"
      ? String(item.age)
      : item.age;
  if (typeof raw !== "string") return "low";
  const range = parseAgeRange(raw);
  if (!range) return "low";
  if (range[0] < 13) return "high";
  if (range[0] < 26) return "medium";
  return "low";
}

// ─── Component ────────────────────────────────────────────────────────────────

type LoadStatus = "loading" | "error" | "ready";

export default function Database() {
  const toast = useToast();
  const [mapTab, setMapTab] = useState<"map" | "heat">("map");
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [items, setItems] = useState<MatchCandidate[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async (fetchCursor: string | null) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    if (fetchCursor) setLoadingMore(true);
    else setStatus("loading");
    try {
      const page = await getFoundReports(fetchCursor ?? undefined, controller.signal);
      if (controller.signal.aborted) return;
      setItems((current) => (fetchCursor ? [...current, ...page.items] : page.items));
      setNextCursor(page.next_cursor);
      setStatus("ready");
      setErrorMessage(null);
    } catch (err) {
      if (controller.signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
        return;
      }
      setErrorMessage(
        err instanceof ApiError ? err.message : "Unable to load records. Please try again.",
      );
      setStatus("error");
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    void load(null);
    return () => inFlight.current?.abort();
  }, [load]);

  const visible = useMemo(
    () => items.filter((item) => filterItem(item, filters)),
    [items, filters],
  );

  const dots = useMemo<MapDot[]>(() => {
    const dots: MapDot[] = [];
    for (const item of visible) {
      const city = resolveCity(item);
      if (!city) continue;
      dots.push({ x: CITY[city].x, y: CITY[city].y, level: levelFor(item) });
    }
    return dots;
  }, [visible]);

  const handleLoadMore = () => {
    if (!nextCursor || loadingMore || status !== "ready") return;
    void load(nextCursor);
  };

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-9">
      <h1 className="font-serif text-[26px] font-medium tracking-[-0.01em] text-ink">
        Missing Persons Database
      </h1>
      <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-ink2">
        Browse and filter from verified sources including government records, NGOs and
        community reports.
      </p>

      {/* filters */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((f) => (
            <div key={f.label} className="w-[128px]">
              <label className="mb-[6px] block text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink3">
                {f.label}
              </label>
              <SelectInput
                className="[&>div]:w-full"
                aria-label={f.label}
                value={filters[f.label] ?? f.options[0]}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, [f.label]: event.target.value }))
                }
              >
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </SelectInput>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3.5 pb-0.5">
          {status === "ready" && (
            <span className="text-[12px] text-ink2">
              {visible.length} of {items.length} loaded records shown
            </span>
          )}
          <div className="flex items-center gap-1 rounded-[9px] border border-line bg-card p-1">
            <button
              aria-label="Grid view"
              onClick={() => setLayout("grid")}
              className={`flex size-7 cursor-pointer items-center justify-center rounded-[7px] ${layout === "grid" ? "bg-ink text-paper2" : "text-ink3"}`}
            >
              <LayoutGrid size={13.5} />
            </button>
            <button
              aria-label="List view"
              onClick={() => setLayout("list")}
              className={`flex size-7 cursor-pointer items-center justify-center rounded-[7px] ${layout === "list" ? "bg-ink text-paper2" : "text-ink3"} transition-colors hover:text-ink`}
            >
              <List size={13.5} />
            </button>
          </div>
        </div>
      </div>

      {/* list + map */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* person list */}
        <div
          className={`overflow-hidden rounded-[18px] border border-line bg-card ${
            layout === "grid" && status === "ready" && visible.length > 0
              ? "grid gap-px bg-line sm:grid-cols-2"
              : ""
          }`}
        >
          {status === "loading" ? (
            <div className="flex flex-col">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-4 px-5 py-4 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-line2"
                >
                  <div className="size-[54px] shrink-0 rounded-[12px] bg-paper2" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 rounded bg-paper2" />
                    <div className="h-3 w-1/4 rounded bg-paper2" />
                    <div className="h-3 w-1/5 rounded bg-paper2" />
                  </div>
                  <div className="hidden h-8 w-24 rounded-[8px] bg-paper2 sm:block" />
                </div>
              ))}
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-paper2 text-ink3">
                <Search size={24} strokeWidth={1.7} />
              </span>
              <p className="text-[13px] font-medium text-ink">Couldn’t load records</p>
              <p className="max-w-[300px] text-[12px] leading-relaxed text-ink2">{errorMessage}</p>
              <Btn
                variant="outline"
                className="h-9 rounded-[9px] px-4 text-[12px]"
                onClick={() => void load(null)}
              >
                Try Again
              </Btn>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-paper2 text-ink3">
                <Search size={24} strokeWidth={1.7} />
              </span>
              <p className="text-[13px] font-medium text-ink">
                {items.length === 0 ? "No records available yet" : "No records match these filters"}
              </p>
              <p className="max-w-[280px] text-[12px] leading-relaxed text-ink2">
                {items.length === 0
                  ? "The database returned no records for this source."
                  : "Try adjusting the state, age, gender, or status filters above."}
              </p>
            </div>
          ) : (
            visible.map((item, i) => {
              const photo = displayPhoto(item);
              const age = displayAge(item);
              const dateLabel = displayDate(item);
              return (
                <motion.div
                  key={item.found_id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * Math.min(i, 8), duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className={`group flex items-center gap-4 bg-card px-5 py-4 transition-colors duration-300 hover:bg-paper2 ${layout === "list" ? "[&:not(:first-child)]:border-t [&:not(:first-child)]:border-line2" : "flex-col items-start"}`}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={displayName(item)}
                      loading="lazy"
                      className="size-[54px] shrink-0 rounded-[12px] object-cover"
                    />
                  ) : (
                    <span className="flex size-[54px] shrink-0 items-center justify-center rounded-[12px] bg-paper2 text-ink3">
                      <Search size={18} strokeWidth={1.7} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-[16px] font-medium text-ink">
                      {displayName(item)}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink2">
                      {[item.gender ?? null, age]
                        .filter((v): v is string => typeof v === "string")
                        .join(" · ") || "Details unavailable"}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-ink3">
                      {[item.district, item.state]
                        .filter((v): v is string => typeof v === "string")
                        .join(", ") || item.location || ""}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    {dateLabel && <div className="text-[12px] text-ink2">{dateLabel}</div>}
                    <div className={`flex justify-end ${dateLabel ? "mt-2.5" : ""}`}>
                      <Btn
                        variant="outline"
                        className="h-8 rounded-[8px] px-3.5 text-[11.5px]"
                        onClick={() => toast("Record details are not available yet. This view is coming soon.")}
                      >
                        View Details
                      </Btn>
                    </div>
                  </div>
                  <Btn
                    variant="outline"
                    className="h-8 shrink-0 rounded-[8px] px-3.5 text-[11.5px] sm:hidden"
                    onClick={() => toast("Record details are not available yet. This view is coming soon.")}
                  >
                    View
                  </Btn>
                </motion.div>
              );
            })
          )}
        </div>

        {/* map card */}
        <div className="overflow-hidden rounded-[18px] border border-line bg-card">
          <div className="flex items-center gap-2 p-3">
            {(["map", "heat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMapTab(t)}
                className={`h-8 cursor-pointer rounded-[9px] px-4 text-[12px] font-medium transition-all duration-300 ${
                  mapTab === t
                    ? "bg-ink text-paper2"
                    : "text-ink2 hover:bg-paper2 hover:text-ink"
                }`}
              >
                {t === "map" ? "Map View" : "Heatmap"}
              </button>
            ))}
          </div>

          <div className="relative mx-3 mb-3 h-[330px] overflow-hidden rounded-[14px] bg-[#eef1ea]">
            {/* soft terrain blobs */}
            <div className="absolute -left-10 -top-10 size-44 rounded-full bg-[#e4ead9]" />
            <div className="absolute bottom-6 right-0 size-40 rounded-full bg-[#e9ecdf]" />
            <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
              <IndiaMap
                className="h-full w-full p-5"
                fill={mapTab === "map" ? "rgba(253,250,244,0.85)" : "rgba(253,250,244,0.55)"}
                stroke="rgba(35,32,27,0.22)"
                dots={dots}
                heat={mapTab === "heat"}
              />
            </div>

            {status === "ready" && dots.length === 0 && (
              <div className="absolute inset-x-3 bottom-3 rounded-[9px] border border-line bg-card/95 px-3 py-2 text-[10.5px] leading-relaxed text-ink3">
                No loaded records match the mapped cities.
              </div>
            )}

            {/* zoom */}
            <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-[9px] border border-line bg-card shadow-sm">
              <button
                aria-label="Zoom in"
                onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}
                className="flex size-8 cursor-pointer items-center justify-center border-b border-line2 text-ink2 transition-colors hover:text-ink"
              >
                <Plus size={14} />
              </button>
              <button
                aria-label="Zoom out"
                onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
                className="flex size-8 cursor-pointer items-center justify-center text-ink2 transition-colors hover:text-ink"
              >
                <Minus size={14} />
              </button>
            </div>

            {/* legend */}
            <div className="absolute left-3 top-3 rounded-[9px] border border-line bg-card/95 px-3 py-2">
              {[
                { c: "#c0452b", l: "High" },
                { c: "#d97b3f", l: "Medium" },
                { c: "#e3c584", l: "Low" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-1.5 py-[2px]">
                  <span className="size-2 rounded-full" style={{ background: x.c }} />
                  <span className="text-[10px] text-ink2">{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* pagination */}
      {status === "ready" && visible.length > 0 && nextCursor && (
        <div className="mt-6 flex justify-center">
          <Btn
            variant="outline"
            className="h-10 rounded-[10px] px-6 text-[12.5px]"
            disabled={loadingMore}
            onClick={handleLoadMore}
          >
            {loadingMore ? "Loading…" : "Load More"}
          </Btn>
        </div>
      )}

      {status === "ready" && visible.length > 0 && !nextCursor && (
        <p className="mt-6 text-center text-[11.5px] text-ink3">
          You&rsquo;ve reached the end of the available records for this source.
        </p>
      )}
    </div>
  );
}

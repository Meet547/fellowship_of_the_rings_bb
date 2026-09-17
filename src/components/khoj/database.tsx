"use client";

import { motion } from "framer-motion";
import { LayoutGrid, List, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Btn, SelectInput } from "./ui";
import { IndiaMap, CITY, type MapDot } from "./india-map";
import { PEOPLE } from "@/lib/khoj/data";
import type { Navigate } from "@/lib/khoj/router";

const DOTS: MapDot[] = [
  { x: CITY.mumbai.x, y: CITY.mumbai.y, level: "high" }, // Mumbai
  { x: CITY.delhi.x, y: CITY.delhi.y, level: "high" }, // Delhi
  { x: CITY.patna.x, y: CITY.patna.y, level: "medium" }, // Patna
  { x: CITY.lucknow.x, y: CITY.lucknow.y, level: "medium" }, // Lucknow
  { x: CITY.kolkata.x, y: CITY.kolkata.y, level: "high" }, // Kolkata
  { x: CITY.hyderabad.x, y: CITY.hyderabad.y, level: "medium" }, // Hyderabad
  { x: CITY.bengaluru.x, y: CITY.bengaluru.y, level: "low" }, // Bengaluru
  { x: CITY.chennai.x, y: CITY.chennai.y, level: "low" }, // Chennai
  { x: CITY.jaipur.x, y: CITY.jaipur.y, level: "medium" }, // Jaipur
  { x: CITY.bhopal.x, y: CITY.bhopal.y, level: "low" }, // Bhopal
];

const FILTERS = [
  { label: "State", options: ["All States", "Maharashtra", "Delhi", "Bihar", "West Bengal"] },
  { label: "Age", options: ["Any Age", "0-12", "13-25", "26-60", "60+"] },
  { label: "Gender", options: ["Any", "Male", "Female", "Other"] },
  { label: "Date Missing", options: ["Any", "Last 7 days", "Last 30 days", "This year"] },
  { label: "Status", options: ["All", "Missing", "Found"] },
];

export default function Database({ navigate }: { navigate: Navigate }) {
  const [mapTab, setMapTab] = useState<"map" | "heat">("map");
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const people = useMemo(() => PEOPLE.filter((person) => {
    const state = filters.State;
    const gender = filters.Gender;
    const status = filters.Status;
    return (!state || state === "All States" || person.location.includes(state)) &&
      (!gender || gender === "Any" || person.gender === gender) &&
      (!status || status === "All" || person.status === status.toLowerCase());
  }), [filters]);

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
              <SelectInput className="[&>div]:w-full" aria-label={f.label} value={filters[f.label] ?? f.options[0]} onChange={(event) => setFilters((current) => ({ ...current, [f.label]: event.target.value }))}>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </SelectInput>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3.5 pb-0.5">
          <span className="text-[12px] text-ink2">{people.length} sample records · 248,950 total</span>
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
        <div className={`overflow-hidden rounded-[18px] border border-line bg-card ${layout === "grid" ? "grid gap-px bg-line sm:grid-cols-2" : ""}`}>
          {people.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`group flex items-center gap-4 bg-card px-5 py-4 transition-colors duration-300 hover:bg-paper2 ${layout === "list" ? "[&:not(:first-child)]:border-t [&:not(:first-child)]:border-line2" : "flex-col items-start"}`}
            >
              { }
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="size-[54px] shrink-0 rounded-[12px] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-[16px] font-medium text-ink">
                  {p.name}
                </div>
                <div className="mt-0.5 text-[12px] text-ink2">
                  {p.gender} · {p.age}
                </div>
                <div className="mt-0.5 text-[11px] text-ink3">{p.location}</div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-[12px] text-ink2">{p.since}</div>
                <div className="mt-2.5 flex justify-end">
                  <Btn
                    variant="outline"
                    className="h-8 rounded-[8px] px-3.5 text-[11.5px]"
                    onClick={() => navigate("match")}
                  >
                    View Details
                  </Btn>
                </div>
              </div>
              <Btn
                variant="outline"
                className="h-8 shrink-0 rounded-[8px] px-3.5 text-[11.5px] sm:hidden"
                onClick={() => navigate("match")}
              >
                View
              </Btn>
            </motion.div>
          ))}
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
                dots={DOTS}
                showTooltip={mapTab === "map"}
                heat={mapTab === "heat"}
              />
            </div>

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
            <div className="absolute bottom-3 left-3 rounded-[9px] border border-line bg-card/95 px-3 py-2">
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
    </div>
  );
}

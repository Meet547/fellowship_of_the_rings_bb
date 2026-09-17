"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MapPin,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "./app-shell";
import { Button, EASE, MatchBadge, PersonPhoto, SourceBadge, fieldCls, labelCls } from "./shared";
import { GENDERS, INDIAN_STATES, SEARCH_RESULTS, SEARCH_TIPS } from "@/lib/khoj/data";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label className={labelCls}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldCls + " mt-2 appearance-none pr-9"}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3.5 h-4 w-4 text-ink-faint" />
    </div>
  );
}

export function SearchPage() {
  const { filters, setFilters, navigate } = useKhoj();
  const [tab, setTab] = useState<"basic" | "advanced">("basic");

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("results");
  };

  return (
    <AppShell active="search">
      <div className="mx-auto max-w-[680px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="display-xl text-[clamp(30px,3.4vw,40px)]">
            Search for a missing person
          </h1>
          <p className="mt-2.5 text-[13.5px] text-ink-soft">
            Search across government records, NGOs and public sources.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 rounded-2xl border border-line bg-paper-2 p-6"
        >
          {/* tabs */}
          <div className="flex gap-7 border-b border-line">
            {(["basic", "advanced"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "micro relative pb-3 !text-[10px] normal-case tracking-[0.04em] transition-colors",
                  tab === t ? "font-medium text-ink" : "text-ink-faint hover:text-ink-2"
                )}
              >
                {t === "basic" ? "Basic Search" : "Advanced Search"}
                {tab === t && (
                  <motion.span
                    layoutId="search-tab"
                    className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-ink"
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={run} className="mt-6 space-y-4">
            <AnimatePresence mode="wait">
              {tab === "basic" ? (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="s-name" className={labelCls}>
                      Name
                    </label>
                    <input
                      id="s-name"
                      value={filters.name}
                      onChange={(e) => setFilters({ name: e.target.value })}
                      placeholder="Enter name"
                      className={fieldCls + " mt-2"}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="s-age" className={labelCls}>
                        Age
                      </label>
                      <input
                        id="s-age"
                        value={filters.age}
                        onChange={(e) => setFilters({ age: e.target.value })}
                        placeholder="e.g. 26"
                        inputMode="numeric"
                        className={fieldCls + " mt-2 tabular"}
                      />
                    </div>
                    <Select
                      label="Gender"
                      value={filters.gender}
                      options={GENDERS}
                      onChange={(v) => setFilters({ gender: v })}
                    />
                    <Select
                      label="State"
                      value={filters.state}
                      options={INDIAN_STATES}
                      onChange={(v) => setFilters({ state: v })}
                    />
                  </div>
                  <div>
                    <label htmlFor="s-city" className={labelCls}>
                      City / Location
                    </label>
                    <input
                      id="s-city"
                      value={filters.city}
                      onChange={(e) => setFilters({ city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className={fieldCls + " mt-2"}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Gender"
                      value={filters.gender}
                      options={GENDERS}
                      onChange={(v) => setFilters({ gender: v })}
                    />
                    <Select
                      label="State"
                      value={filters.state}
                      options={INDIAN_STATES}
                      onChange={(v) => setFilters({ state: v })}
                    />
                  </div>
                  <div>
                    <label htmlFor="s-desc" className={labelCls}>
                      Distinguishing details
                    </label>
                    <textarea
                      id="s-desc"
                      rows={4}
                      placeholder="Language, marks, clothing, items they carry…"
                      className={fieldCls + " mt-2 resize-none"}
                    />
                  </div>
                  <div>
                    <label htmlFor="s-date" className={labelCls}>
                      Last seen around
                    </label>
                    <input
                      id="s-date"
                      type="date"
                      className={fieldCls + " mt-2 tabular"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full !py-3.5" magnetic>
              Search
            </Button>
          </form>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 rounded-2xl border border-line bg-paper-2 p-5"
        >
          <div className="text-[13px] font-medium text-ink">Tips</div>
          <ul className="mt-3 space-y-2.5">
            {SEARCH_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-ink/40" />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </AppShell>
  );
}

/* ==================== Search Results ==================== */
export function SearchResultsPage() {
  const { openCase, navigate } = useKhoj();
  const [showFilters, setShowFilters] = useState(false);
  const [min, setMin] = useState(0);

  const list = SEARCH_RESULTS.filter((p) => p.match >= min);

  return (
    <AppShell active="search">
      <div className="mx-auto max-w-[860px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <button
              onClick={() => navigate("search")}
              className="micro flex items-center gap-1.5 !text-[9.5px] text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to search
            </button>
            <h1 className="display-xl mt-3 text-[clamp(30px,3.4vw,40px)]">
              Search results
            </h1>
            <p className="mt-1.5 text-[13.5px] text-ink-soft">
              We found {list.length} possible matches.
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12.5px] font-medium transition-all",
              showFilters ? "border-ink bg-ink text-paper" : "border-line-2 bg-paper-2 hover:border-ink/40"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </button>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-paper-2 p-4">
                <span className="micro !text-[9px] text-ink-faint">Minimum match:</span>
                {[0, 50, 60, 70].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMin(m)}
                    className={cn(
                      "tabular rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                      min === m ? "bg-ink text-paper" : "border border-line-2 text-ink-soft hover:border-ink/40"
                    )}
                  >
                    {m === 0 ? "All" : `${m}%+`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 space-y-3">
          {list.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
              className="group flex flex-col gap-4 rounded-2xl border border-line bg-paper-2 p-4 transition-colors hover:border-ink/30 sm:flex-row sm:items-center"
            >
              <PersonPhoto
                photo={p.photo}
                name={p.name}
                className="h-[74px] w-[74px] shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <MatchBadge pct={p.match} />
                  <span className="text-[14.5px] font-medium tracking-[-0.01em]">{p.name}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3 w-3 text-ink-faint" /> {p.gender} · {p.age}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-ink-faint" /> {p.location}
                  </span>
                  <span>{p.dateLabel}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
                <SourceBadge source={p.source} />
                <button
                  onClick={() => openCase(p.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-[12px] font-medium transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  View details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

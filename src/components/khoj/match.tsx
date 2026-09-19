"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  Eye,
  FileText,
  Flag,
  HeartHandshake,
  MapPin,
  Newspaper,
  Phone,
  Ruler,
  Search,
  Shirt,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Btn, useToast } from "./ui";
import type { Navigate } from "@/lib/khoj/router";
import { useSearch } from "@/lib/khoj/search-context";
import type { Match, MatchCandidate, StructuredDetails } from "@/lib/khoj/api-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Scores from the API are already on a 0–100 scale. */
function matchLabel(_score: number): string {
  return "Potential Match";
}

function safeStr(v: string | number | boolean | string[] | [number, number] | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join("–");
  return String(v);
}

/** Format age_range [min, max] or fall back to age field. */
function formatAge(candidate: MatchCandidate): string {
  if (candidate.age_range && Array.isArray(candidate.age_range)) {
    const [lo, hi] = candidate.age_range;
    return lo === hi ? `${lo} years` : `${lo}–${hi} years`;
  }
  return candidate.age ? safeStr(candidate.age) : "—";
}

type Row = { icon: ReactNode; label: string; value: ReactNode };

function buildRows(candidate: MatchCandidate, match: Match): Row[] {
  const rows: Row[] = [];

  const age = formatAge(candidate);
  if (age !== "—") rows.push({ icon: <UserRound size={14} />, label: "Age", value: age });
  if (candidate.gender) rows.push({ icon: <UserRound size={14} />, label: "Gender", value: safeStr(candidate.gender) });
  if (candidate.location) rows.push({ icon: <MapPin size={14} />, label: "Location", value: safeStr(candidate.location) });
  if (candidate.district || candidate.state) {
    const district = [candidate.district, candidate.state].filter(Boolean).join(", ");
    rows.push({ icon: <MapPin size={14} />, label: "District / State", value: district });
  }
  if (candidate.date_found) rows.push({ icon: <CalendarDays size={14} />, label: "Date found", value: safeStr(candidate.date_found) });
  if (candidate.clothing) rows.push({ icon: <Shirt size={14} />, label: "Clothing", value: safeStr(candidate.clothing) });
  if (candidate.description) rows.push({ icon: <FileText size={14} />, label: "Description", value: safeStr(candidate.description) });
  if (candidate.remarks) rows.push({ icon: <FileText size={14} />, label: "Remarks", value: safeStr(candidate.remarks) });
  if (candidate.height_cm) rows.push({ icon: <Ruler size={14} />, label: "Height", value: `${candidate.height_cm} cm` });
  if (candidate.police_station) rows.push({ icon: <Building2 size={14} />, label: "Police station", value: safeStr(candidate.police_station) });
  if (candidate.source) {
    rows.push({
      icon: <Newspaper size={14} />,
      label: "Source",
      value: candidate.source_url ? (
        <a
          href={candidate.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rust underline underline-offset-2 hover:opacity-80"
        >
          {candidate.source}
        </a>
      ) : (
        safeStr(candidate.source)
      ),
    });
  }

  // Always show similarity score (already 0–100 from API).
  rows.push({
    icon: <HeartHandshake size={14} />,
    label: "Similarity score",
    value: `${Math.round(match.final_score)}%`,
  });

  return rows;
}

/** Badge colour based on structured_detail value string. */
function detailBadgeClass(value: string | null | undefined): string {
  if (!value) return "border border-line bg-paper2 text-ink2";
  const v = value.toLowerCase();
  if (v === "match" || v === "strong" || v === "exact") return "bg-badgeg text-badgegt";
  if (v.startsWith("close") || v === "partial") return "bg-peach text-rust";
  return "border border-line bg-paper2 text-ink2";
}

function StructuredBadges({ details }: { details: StructuredDetails }) {
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10.5px] font-medium capitalize ${detailBadgeClass(String(value))}`}
        >
          {key.replace(/_/g, " ")}: {String(value)}
        </span>
      ))}
    </div>
  );
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

function EmptyState({ navigate, message }: { navigate: Navigate; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6">
      <span className="flex size-20 items-center justify-center rounded-full bg-sage text-greenicon">
        <Search size={32} strokeWidth={1.7} />
      </span>
      <h1 className="font-serif text-[24px] font-medium text-ink">No matches found</h1>
      <p className="max-w-[380px] text-center text-[13px] leading-relaxed text-ink2">{message}</p>
      <Btn onClick={() => navigate("find")}>Search Again</Btn>
    </div>
  );
}

/**
 * Shown when the user lands on #/match directly (hard refresh or external link)
 * and there is no active search session in memory.
 * Does NOT claim a search ran — it honestly says the session has expired.
 */
function SessionExpiredState({ navigate }: { navigate: Navigate }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6">
      <span className="flex size-20 items-center justify-center rounded-full bg-paper2 text-ink3">
        <Clock size={32} strokeWidth={1.7} />
      </span>
      <h1 className="font-serif text-[24px] font-medium text-ink">Search session expired</h1>
      <p className="max-w-[380px] text-center text-[13px] leading-relaxed text-ink2">
        Your results are no longer in memory — this can happen after a page refresh.
        Start a new search to see matches.
      </p>
      <Btn onClick={() => navigate("find")}>Start a New Search</Btn>
    </div>
  );
}
function ErrorState({ navigate, message }: { navigate: Navigate; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6">
      <span className="flex size-20 items-center justify-center rounded-full bg-peach text-rust">
        <AlertCircle size={32} strokeWidth={1.7} />
      </span>
      <h1 className="font-serif text-[24px] font-medium text-ink">Search failed</h1>
      <p className="max-w-[380px] text-center text-[13px] leading-relaxed text-ink2">{message}</p>
      <Btn onClick={() => navigate("find")}>Try Again</Btn>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Match({ navigate }: { navigate: Navigate }) {
  const toast = useToast();
  const { searchResults, searchError } = useSearch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const goToIndex = (idx: number) => {
    setCurrentIndex(idx);
    setFeedback(null);
  };

  const matches = searchResults?.matching?.matches ?? [];

  if (searchError) {
    return <ErrorState navigate={navigate} message={searchError} />;
  }

  // searchResults is null means no search was ever run in this session
  // (e.g. direct URL navigation or hard refresh). Show an explicit expired state —
  // do NOT claim "no matches found" when no search actually ran.
  if (!searchResults) {
    return <SessionExpiredState navigate={navigate} />;
  }

  // A search ran but returned zero candidates.
  if (matches.length === 0) {
    const noInfo = searchResults.matching?.status === "no_searchable_information";
    return (
      <EmptyState
        navigate={navigate}
        message={
          noInfo
            ? "We couldn't extract enough details from your query. Try adding age, gender, or a specific location."
            : "We searched across all available databases and found no matching records. Try rephrasing your query."
        }
      />
    );
  }

  const match = matches[currentIndex];
  const candidate = match.candidate;
  const name = candidate.name?.trim() || "Unknown";
  // photo_urls is an array; take the first element as primary photo.
  const photo = (candidate.photo_urls && candidate.photo_urls.length > 0)
    ? candidate.photo_urls[0]
    : "/images/khoj-unknown.jpg";
  const label = matchLabel(match.final_score);
  const scorePercent = Math.round(match.final_score);
  const rows = buildRows(candidate, match);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-[1150px] px-6">
        {/* top bar */}
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate("find")}
            className="group inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Search
          </button>
          <span className="text-[12px] text-ink3">
            Result {currentIndex + 1} of {matches.length}
          </span>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  goToIndex(currentIndex - 1);
                }
              }}
              disabled={currentIndex === 0}
              className="group inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink2 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink2"
            >
              <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
              Previous Match
            </button>
            <button
              onClick={() => {
                if (currentIndex < matches.length - 1) {
                  goToIndex(currentIndex + 1);
                } else {
                  toast("No more matches for this search.");
                }
              }}
              className="group inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
            >
              Next Match
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* main grid */}
        <div className="grid items-start gap-8 pb-14 lg:grid-cols-[300px_1fr_330px]">
          {/* photo */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={photo}
              alt={name}
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/khoj-unknown.jpg"; }}
              className="h-[310px] w-full rounded-[18px] object-cover"
            />
            {/* thumbnail strip */}
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {(candidate.photo_urls ?? [photo]).slice(0, 3).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Additional photo"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/khoj-unknown.jpg"; }}
                  className="aspect-square w-full cursor-pointer rounded-[10px] object-cover opacity-90 transition-all duration-300 hover:opacity-100"
                />
              ))}
              <div className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-[10px] bg-night px-1 text-center text-[9px] font-medium leading-tight text-smoke transition-transform duration-300 hover:scale-[1.03]">
                {candidate.found_id}
              </div>
            </div>
          </motion.div>

          {/* details */}
          <motion.div
            key={`details-${currentIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full bg-badgeg px-3 text-[11.5px] font-semibold text-badgegt">
                {label} ({scorePercent}%)
              </span>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 text-[11px] font-medium text-amber-800">
                <AlertCircle size={11} strokeWidth={2} />
                Requires Human Verification
              </span>
            </div>
            <h1 className="mt-3 font-serif text-[28px] font-medium tracking-[-0.01em] text-ink">
              {name}
            </h1>

            <div className="mt-5 divide-y divide-line2">
              {rows.map((r, i) => (
                <div key={i} className="flex items-start gap-3 py-[9px]">
                  <span className="mt-[2px] shrink-0 text-ink3">{r.icon}</span>
                  <span className="w-[138px] shrink-0 text-[12px] text-ink3">{r.label}</span>
                  <span className="text-[13px] font-medium text-ink">{r.value}</span>
                </div>
              ))}
            </div>

            {/* structured detail badges */}
            <StructuredBadges details={match.structured_details} />

            <div className="mt-7 flex flex-wrap gap-3">
              <Btn onClick={() => toast("The full report view is not available yet.")}>
                <span className="flex items-center gap-2">
                  <FileText size={14} /> View Full Report
                </span>
              </Btn>
              <Btn variant="outline" onClick={() => toast("Side-by-side image comparison is not available yet.")}>
                <span className="flex items-center gap-2">
                  <Eye size={14} /> Compare Images
                </span>
              </Btn>
              <Btn variant="ghost" onClick={() => toast("Flagging is not available yet — please note this person\u2019s name and details.")}>
                <span className="flex items-center gap-1.5">
                  <Flag size={13} /> Report as Incorrect
                </span>
              </Btn>
            </div>
          </motion.div>

          {/* right column */}
          <motion.div
            key={`right-${currentIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* location */}
            <div className="rounded-[18px] border border-line bg-card p-4">
              <div className="flex flex-col gap-1.5 rounded-[12px] bg-[#eef1ea] px-4 py-5">
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink3">
                  <MapPin size={12} strokeWidth={2} />
                  Found location
                </span>
                <span className="text-[15px] font-semibold text-ink">
                  {candidate.location ?? "—"}
                </span>
                {(candidate.district || candidate.state) && (
                  <span className="text-[12px] text-ink2">
                    {[candidate.district, candidate.state].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* feedback */}
            <div className="rounded-[18px] border border-line bg-card p-5">
              <div className="text-[13.5px] font-semibold text-ink">
                Does this match look correct?
              </div>
              <p className="mt-1 text-[12px] text-ink2">
                Feedback saves are not built into the backend yet — this preview
                is not stored.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setFeedback("yes")}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border text-[11.5px] font-medium transition-all duration-300 active:scale-[0.98] ${
                    feedback === "yes"
                      ? "border-badgegt bg-badgeg text-badgegt"
                      : "border-badgegt/35 text-badgegt hover:bg-badgeg/35"
                  }`}
                >
                  <ThumbsUp size={13} /> Yes, this is correct
                </button>
                <button
                  onClick={() => setFeedback("no")}
                  className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border text-[11.5px] font-medium transition-all duration-300 active:scale-[0.98] ${
                    feedback === "no"
                      ? "border-ink bg-ink text-paper2"
                      : "border-line text-ink2 hover:border-ink/35 hover:text-ink"
                  }`}
                >
                  <ThumbsDown size={13} /> No, not a match
                </button>
              </div>
              <p className="mt-2.5 text-[10.5px] leading-relaxed text-ink3">
                Feedback persistence is coming soon. Every match still requires
                human verification.
              </p>
            </div>

            {/* contact card */}
            <div className="rounded-[18px] bg-peach p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-rust text-paper2">
                  <Phone size={15} strokeWidth={1.9} />
                </span>
                <div>
                  <div className="text-[12px] font-semibold text-ink">Know this person?</div>
                  <div className="text-[11px] text-ink2">Connect through our verified network</div>
                </div>
              </div>
<Btn className="mt-4 h-9 w-full rounded-[9px] text-[12px]" onClick={() => toast("Contact requests are not available yet \u2014 use the details shown and verify through official channels.")}>
                  Request Contact Details
                </Btn>
            </div>
          </motion.div>
        </div>
      </div>

      {/* dark CTA */}
      <section className="relative overflow-hidden bg-night">
        <div className="absolute inset-0">
          <img
            src="/images/khoj-detective-walk.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30" />
        </div>
        <div className="relative mx-auto flex max-w-[1150px] flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <h2 className="display-hero max-w-[430px] text-[clamp(26px,3vw,34px)] text-smoke">
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                Not just missing people.
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                A more connected India.
              </motion.span>
            </span>
          </h2>
          <div className="text-right">
            <div className="font-serif text-[28px] font-semibold tracking-[0.16em] text-smoke">KHOJ</div>
            <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.4em] text-smoke/50">
              People. Places. Possibilities
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

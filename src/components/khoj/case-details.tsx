"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  CalendarDays,
  MapPin,
  Phone,
  Share2,
  User,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "./app-shell";
import { MatchBadge, PersonPhoto } from "./shared";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Timeline", "Photos", "Source Details"] as const;

/* Stylized map with streets + pin */
function MiniMap() {
  return (
    <div className="relative h-[190px] overflow-hidden rounded-2xl border border-line bg-[#eef0ea]">
      <svg viewBox="0 0 400 190" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <rect width="400" height="190" fill="#edefe9" />
        <path d="M0 60 Q120 40 220 70 T400 55" stroke="#dfe3d8" strokeWidth="14" fill="none" />
        <path d="M0 130 Q140 115 260 140 T400 125" stroke="#dfe3d8" strokeWidth="10" fill="none" />
        <path d="M80 0 Q95 90 70 190" stroke="#e4e7de" strokeWidth="9" fill="none" />
        <path d="M190 0 Q200 100 180 190" stroke="#e4e7de" strokeWidth="12" fill="none" />
        <path d="M300 0 Q310 80 290 190" stroke="#e4e7de" strokeWidth="8" fill="none" />
        <rect x="24" y="22" width="38" height="26" rx="4" fill="#e2e6db" />
        <rect x="120" y="80" width="46" height="30" rx="4" fill="#e2e6db" />
        <rect x="230" y="24" width="34" height="24" rx="4" fill="#e2e6db" />
        <rect x="320" y="90" width="40" height="28" rx="4" fill="#e2e6db" />
        <circle cx="150" cy="150" r="22" fill="#d8e4d2" />
        <circle cx="360" cy="30" r="16" fill="#d8e4d2" />
      </svg>
      {/* pin */}
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.35 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
      >
        <div className="flex flex-col items-center">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[#f4f2ee] shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="h-2.5 w-[2.5px] bg-ink" />
          <div className="h-1.5 w-1.5 rounded-full bg-ink/60" />
        </div>
      </motion.div>
      <button className="absolute bottom-3 right-3 rounded-full bg-white px-3.5 py-2 text-[11.5px] font-medium shadow-md transition-transform hover:scale-[1.03]">
        View on Map
      </button>
    </div>
  );
}

export default function CaseDetails() {
  const { selectedCaseId, navigate, saved, toggleSaved } = useKhoj();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const person = {
    id: selectedCaseId ?? "#KHUJ-2026-001",
    name: "Ramesh Kumar",
    match: 78,
    photo: "/images/portrait-ramesh.jpg",
    gender: "Male",
    age: "62 years",
    location: "Thane, Maharashtra",
    date: "Found: 12 Sep 2026",
    source: "Maharashtra Police",
    updated: "16 Sep 2026",
  };

  const isSaved = saved.includes(person.id);

  return (
    <AppShell active="cases">
      <div className="mx-auto max-w-[900px]">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("results")}
            className="flex items-center gap-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to results
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `Khoj case — ${person.name}` }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-4 py-2 text-[12px] font-medium transition-all hover:border-ink/40"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button
              onClick={() => toggleSaved(person.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition-all",
                isSaved
                  ? "border-ink bg-ink text-[#f4f2ee]"
                  : "border-line-2 bg-white hover:border-ink/40"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-5 grid gap-6 rounded-[24px] border border-line bg-white/80 p-6 sm:grid-cols-[200px_1fr_220px]"
        >
          <div className="relative">
            <PersonPhoto
              photo={person.photo}
              name={person.name}
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
          </div>

          <div>
            <MatchBadge pct={person.match} />
            <h1 className="mt-2.5 text-[24px] font-semibold tracking-[-0.02em]">
              {person.name}
            </h1>
            <div className="mt-4 space-y-2.5 text-[13px] text-ink-2">
              <div className="flex items-center gap-2.5">
                <User className="h-3.5 w-3.5 text-ink-faint" /> {person.gender} · {person.age}
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-ink-faint" /> {person.location}
              </div>
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-3.5 w-3.5 text-ink-faint" /> {person.date}
              </div>
            </div>
          </div>

          {/* Source card */}
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="text-[11px] font-semibold tracking-wide text-ink-faint">SOURCE</div>
            <div className="mt-2 flex items-center gap-2 text-[13.5px] font-semibold">
              <Building2 className="h-4 w-4 text-ink-2" strokeWidth={1.7} />
              {person.source}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-faint">
              Last updated {person.updated}
            </div>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                alert(
                  "Connecting you to Maharashtra Police helpline 1098 / 112.\n(Demo action)"
                )
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-[12.5px] font-medium text-[#f4f2ee] transition-colors hover:bg-black"
            >
              <Phone className="h-3.5 w-3.5" /> Contact Authority
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex gap-6 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative pb-3 text-[13px] transition-colors",
                tab === t ? "font-semibold text-ink" : "text-ink-faint hover:text-ink-2"
              )}
            >
              {t}
              {tab === t && (
                <motion.span
                  layoutId="case-tab"
                  className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-ink"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="py-6"
          >
            {tab === "Overview" && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[20px] border border-line bg-white/80 p-6">
                  <h3 className="text-[14px] font-semibold">Physical Description</h3>
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      ["Height", "5'6\""],
                      ["Build", "Medium"],
                      ["Complexion", "Wheatish"],
                      ["Hair", "Gray"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[11.5px] text-ink-faint">{k}</div>
                        <div className="mt-0.5 text-[13.5px] font-medium">{v}</div>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <div className="text-[11.5px] text-ink-faint">Identifying features</div>
                      <div className="mt-0.5 text-[13.5px] font-medium">
                        Wears glasses, small mole on left cheek
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-line bg-white/80 p-6">
                  <h3 className="text-[14px] font-semibold">Last Known Location</h3>
                  <p className="mt-1 text-[12px] text-ink-soft">Thane, Maharashtra</p>
                  <div className="mt-4">
                    <MiniMap />
                  </div>
                </div>
              </div>
            )}

            {tab === "Timeline" && (
              <div className="max-w-[640px] space-y-0 rounded-[20px] border border-line bg-white/80 p-6">
                {[
                  ["12 Sep 2026", "Found near Thane railway station by a community volunteer."],
                  ["13 Sep 2026", "Shelter intake completed. Health check normal."],
                  ["14 Sep 2026", "Matched with a missing-person report from Andheri."],
                  ["16 Sep 2026", "Awaiting family confirmation via Maharashtra Police."],
                ].map(([d, e], i, arr) => (
                  <div key={d} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < arr.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-line-2" />
                    )}
                    <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-ink" />
                    <div>
                      <div className="text-[12px] font-semibold text-ink-faint">{d}</div>
                      <div className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{e}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "Photos" && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-line bg-white"
                  >
                    { }
                    <img
                      src={person.photo}
                      alt={`${person.name} record photo ${i + 1}`}
                      className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                      style={{ filter: `grayscale(${i * 0.15}) contrast(${1 - i * 0.03})` }}
                    />
                  </div>
                ))}
              </div>
            )}

            {tab === "Source Details" && (
              <div className="max-w-[560px] rounded-[20px] border border-line bg-white/80 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06]">
                    <Building2 className="h-4.5 w-4.5 h-5 w-5 text-ink" strokeWidth={1.6} />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold">{person.source}</div>
                    <div className="text-[11.5px] text-ink-faint">
                      Verified government source · Record ID MP-2026-09124
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-[13px] text-ink-2">
                  <div className="flex justify-between border-b border-line/70 pb-3">
                    <span className="text-ink-faint">Record created</span>
                    <span>12 Sep 2026</span>
                  </div>
                  <div className="flex justify-between border-b border-line/70 pb-3">
                    <span className="text-ink-faint">Last verified</span>
                    <span>16 Sep 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">Access level</span>
                    <span>Public (limited details)</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

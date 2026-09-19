"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  ListFilter,
  Loader2,
  Mail,
  Search,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo, ScriptNote } from "./ui";
import { SEARCH_STAGES, WAIT_TIPS } from "@/lib/khoj/data";
import type { Navigate } from "@/lib/khoj/router";
import { useSearch } from "@/lib/khoj/search-context";
import { useUserProfile } from "@/lib/khoj/use-user";
import { searchByText, ApiError } from "@/lib/khoj/api";

const STAGE_MS = 2100;

const ORBIT_NODES = [
  { icon: <FileText size={19} strokeWidth={1.8} className="text-ink" />, label: "Description", pos: "left-[6%] top-[16%]" },
  { icon: <Search size={19} strokeWidth={1.8} className="text-ink" />, label: "Search Records", pos: "right-[6%] top-[16%]" },
  { icon: <BrainCircuit size={19} strokeWidth={1.8} className="text-ink" />, label: "Semantic Matching", pos: "left-[6%] bottom-[16%]" },
  { icon: <ListFilter size={19} strokeWidth={1.8} className="text-ink" />, label: "Structured Matching", pos: "right-[6%] bottom-[16%]" },
];

const TIP_ICONS: Record<string, ReactNode> = {
  phone: <Smartphone size={15} strokeWidth={1.8} className="text-ink2" />,
  mail: <Mail size={15} strokeWidth={1.8} className="text-ink2" />,
  users: <UsersRound size={15} strokeWidth={1.8} className="text-ink2" />,
};

/** sessionStorage key used to persist the active query across hard refreshes. */
const QUERY_SESSION_KEY = "khoj_search_query";

export default function Searching({ navigate }: { navigate: Navigate }) {
  const { textQuery, setSearchResults, setSearchError } = useSearch();
  const profile = useUserProfile();
  const [stage, setStage] = useState(0);
  const [pct, setPct] = useState(4);
  const [apiDone, setApiDone] = useState(false);

  // Resolve the query: prefer the in-memory context value (set by Find), then fall
  // back to sessionStorage (survives a hard refresh on #/searching).
  const [displayQuery] = useState<string>(() => {
    if (textQuery.trim()) {
      // Persist to sessionStorage so a hard refresh can recover it.
      try { sessionStorage.setItem(QUERY_SESSION_KEY, textQuery.trim()); } catch { /* ignore */ }
      return textQuery.trim();
    }
    try { return sessionStorage.getItem(QUERY_SESSION_KEY) ?? ""; } catch { return ""; }
  });
  const calledRef = useRef(false);

  // Safety guard: if no query exists after checking both sources, redirect back.
  useEffect(() => {
    if (!displayQuery.trim()) {
      navigate("find");
    }
  }, [displayQuery, navigate]);

  // Stage label advance (purely visual).
  useEffect(() => {
    if (stage >= SEARCH_STAGES.length) return;
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // Progress animation: 0 → 90 before API, held there until API responds.
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 90) { clearInterval(t); return 90; }
        return p + 2;
      });
    }, 120);
    return () => clearInterval(t);
  }, []); // runs once on mount — pct setState updater is stable

  // After API done, quickly finish 90 → 100.
  useEffect(() => {
    if (!apiDone) return;
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) { clearInterval(t); return 100; }
        return p + 5;
      });
    }, 40);
    return () => clearInterval(t);
  }, [apiDone]);

  // Navigate to match once progress hits 100% and API has returned.
  useEffect(() => {
    if (pct >= 100 && apiDone) {
      const t = setTimeout(() => navigate("match"), 700);
      return () => clearTimeout(t);
    }
  }, [pct, apiDone, navigate]);

  // Real API call — fires once on mount using the snapshotted query.
  // On completion (success or error) the sessionStorage entry is cleared so that
  // the next intentional search starts fresh rather than replaying the old query.
  useEffect(() => {
    if (!displayQuery.trim()) return;
    if (calledRef.current) return;
    calledRef.current = true;

    const controller = new AbortController();

    const clearPersistedQuery = () => {
      try { sessionStorage.removeItem(QUERY_SESSION_KEY); } catch { /* ignore */ }
    };

    searchByText(displayQuery, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          clearPersistedQuery();
          setSearchResults(result);
          setSearchError(null);
          setApiDone(true);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          clearPersistedQuery();
          const msg =
            err instanceof ApiError
              ? err.message
              : "Search failed. Please try again.";
          setSearchError(msg);
          setSearchResults(null);
          setApiDone(true);
        }
      });

    return () => controller.abort();
  }, []); // runs once on mount — query snapshotted at component creation

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* light app header */}
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-[68px] max-w-[1150px] items-center justify-between px-6">
          <button onClick={() => navigate("dashboard")} className="cursor-pointer text-left">
            <Logo size="sm" tagline={false} />
          </button>
          <nav className="hidden items-center gap-8 md:flex">
            {(["Dashboard", "Search", "Reports", "Support"] as const).map((l, i) => (
              <button
                key={l}
                onClick={() => navigate(i === 0 ? "dashboard" : i === 1 ? "find" : i === 2 ? "report" : "database")}
                className="link-sweep cursor-pointer text-[13px] font-medium text-ink2 transition-colors hover:text-ink"
              >
                {l}
              </button>
            ))}
          </nav>
          <span className="flex size-9 items-center justify-center rounded-full bg-rust text-[12px] font-semibold text-paper2 uppercase">
            {profile.initial}
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1150px] flex-1 items-center gap-10 px-6 py-12 lg:grid-cols-[230px_1fr_250px]">
        {/* timeline */}
        <div className="hidden flex-col gap-1 lg:flex">
          {SEARCH_STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div key={s} className="relative flex items-center gap-3.5 py-[9px]">
                {i < SEARCH_STAGES.length - 1 && (
                  <span
                    className={`absolute left-[5px] top-[calc(50%+10px)] h-[calc(100%-6px)] w-px transition-colors duration-700 ${
                      done ? "bg-ink/45" : "bg-line"
                    }`}
                  />
                )}
                <motion.span
                  animate={
                    active
                      ? { scale: [1, 1.35, 1], backgroundColor: "#23201b" }
                      : { scale: 1, backgroundColor: done ? "#23201b" : "rgba(35,32,27,0.16)" }
                  }
                  transition={active ? { duration: 2, repeat: Infinity } : { duration: 0.5 }}
                  className="relative z-10 size-[11px] shrink-0 rounded-full ring-4 ring-paper"
                />
                <span
                  className={`text-[12.5px] transition-colors duration-500 ${
                    active ? "font-medium text-ink" : done ? "text-ink2" : "text-ink3"
                  }`}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>

        {/* orbit */}
        <div className="flex flex-col items-center">
          <div className="relative aspect-square w-full max-w-[400px]">
            {/* rings */}
            <div className="absolute inset-[8%] rounded-full border border-dashed border-ink/15" />
            <div className="absolute inset-[24%] rounded-full border border-dashed border-ink/12" />
            <div className="absolute inset-[38%] rounded-full border border-ink/10" />

            {/* rotating nodes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              {ORBIT_NODES.map((n) => (
                <div key={n.label} className={`absolute ${n.pos}`}>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span className="flex size-[52px] items-center justify-center rounded-full border border-line bg-card shadow-[0_10px_26px_-14px_rgba(35,32,27,0.35)]">
                      {n.icon}
                    </span>
                    <span className="w-24 text-center text-[10.5px] font-medium leading-tight text-ink2">
                      {n.label}
                    </span>
                  </motion.div>
                </div>
              ))}
            </motion.div>

            {/* center: query preview */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex size-[128px] flex-col items-center justify-center rounded-full bg-card ring-4 ring-card shadow-[0_20px_50px_-20px_rgba(35,32,27,0.45)]"
              >
                <span className="absolute -inset-2 rounded-full border border-ink/10 animate-breathe" />
                <span className="px-3 text-center text-[9.5px] leading-snug text-ink2 line-clamp-4">
                  {displayQuery}
                </span>
              </motion.div>
            </div>
          </div>

          {/* progress line */}
          <div className="mt-6 flex items-center gap-2.5" role="status">
            <Loader2 size={15} className="animate-spin text-rust" />
            <span className="text-[13px] text-ink2">
              Finding potential matches&hellip; <span className="font-medium text-ink tabular-nums">{pct}%</span> complete
            </span>
          </div>
          <div className="mt-3 h-[3px] w-56 overflow-hidden rounded-full bg-line2">
            <div
              className="h-full rounded-full bg-ink transition-[width] duration-200 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* tips */}
        <div className="rounded-[18px] border border-line bg-card p-5 lg:mt-2">
          <div className="text-[13.5px] font-semibold text-ink">Tips while you wait</div>
          <ul className="mt-4 space-y-4">
            {WAIT_TIPS.map((t) => (
              <li key={t.icon} className="flex items-start gap-3">
                <span className="mt-[1px] shrink-0">{TIP_ICONS[t.icon]}</span>
                <span className="text-[12.5px] leading-relaxed text-ink2">{t.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1150px] px-6 pb-8">
        <ScriptNote rotate={-3} className="text-right text-[22px]">
          People help people.
        </ScriptNote>
      </div>
    </div>
  );
}

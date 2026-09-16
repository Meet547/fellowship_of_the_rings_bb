"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileImage,
  Landmark,
  MapPin,
  Mic,
  Newspaper,
  Paperclip,
  Share2,
  Users,
  Lightbulb,
  Loader2,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./app-shell";
import {
  HandNote,
  MatchBadge,
  PersonPhoto,
  SourceBadge,
  Stepper,
} from "./shared";
import {
  DESCRIBE_CHIPS,
  DESCRIBE_TIPS,
  MATCH_PEOPLE,
  SEARCH_SOURCES,
  SEARCH_STEPS,
  SEARCH_TASKS,
} from "@/lib/khoj/data";
import { extractedFor, useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

const SOURCE_ICONS = {
  landmark: Landmark,
  building: Landmark,
  news: Newspaper,
  share: Share2,
  users: Users,
} as const;

/* =================== Step 1 — Describe =================== */
function DescribeStep() {
  const { findDescription, setFindDescription, findPhotoName, setFindPhotoName, setFindStep } =
    useKhoj();
  const [listening, setListening] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => {
      setListening(false);
      setFindDescription(
        (findDescription ? findDescription + " " : "") +
          "My father Ramesh went missing from Andheri, Mumbai on 12 September. He is around 62, wears glasses and a blue shirt."
      );
    }, 2600);
    return () => clearTimeout(t);
     
  }, [listening]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
          Tell us about the person you&apos;re looking for.
        </h1>
        <p className="mt-2.5 max-w-[560px] text-[13.5px] leading-relaxed text-ink-soft">
          You can type or speak naturally. Share anything you remember — name, age,
          location, last seen, appearance or any other details.
        </p>

        {/* chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {DESCRIBE_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setFindDescription(c);
                taRef.current?.focus();
              }}
              className="rounded-full border border-line-2 bg-white px-3.5 py-2 text-[11.5px] text-ink-soft transition-all hover:border-ink/40 hover:text-ink"
            >
              {c}
            </button>
          ))}
        </div>

        {/* composer */}
        <div className="mt-5 rounded-[22px] border border-line-2 bg-white shadow-[0_18px_44px_-28px_rgba(20,19,17,0.35)] transition-colors focus-within:border-ink/40">
          <textarea
            ref={taRef}
            value={findDescription}
            onChange={(e) => setFindDescription(e.target.value)}
            placeholder="Describe the person you're looking for..."
            rows={6}
            className="w-full resize-none rounded-t-[22px] bg-transparent px-5 pt-5 text-[14px] leading-relaxed outline-none placeholder:text-ink-faint"
          />
          <div className="flex items-center justify-between px-4 pb-4 pt-1">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFindPhotoName(e.target.files?.[0]?.name ?? null)}
                />
                <span className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 text-[12px] text-ink-soft transition-colors hover:border-ink/40 hover:text-ink">
                  <Paperclip className="h-3.5 w-3.5" />
                  {findPhotoName ? findPhotoName : "Attach photo (optional)"}
                </span>
              </label>
              {findPhotoName && (
                <button
                  onClick={() => setFindPhotoName(null)}
                  className="text-[11.5px] text-ink-faint hover:text-ink"
                >
                  remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setListening(!listening)}
                aria-label="Voice input"
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border transition-all",
                  listening
                    ? "border-ink bg-ink text-[#f4f2ee]"
                    : "border-line-2 text-ink-2 hover:border-ink/40"
                )}
              >
                <Mic className="h-4 w-4" strokeWidth={1.7} />
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFindStep(1)}
                disabled={!findDescription.trim() && !findPhotoName}
                aria-label="Send"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[#f4f2ee] shadow-[0_10px_24px_-10px_rgba(20,19,17,0.6)] transition-opacity disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {listening && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-3 flex items-center gap-2 text-[12px] text-ink-soft"
            >
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-ink"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
                  />
                ))}
              </span>
              Listening…
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-4 text-[11.5px] text-ink-faint">
          Your information is private and used only to help with the search.
        </p>
      </motion.div>

      {/* Tips sidebar */}
      <motion.aside
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="flex flex-col gap-4"
      >
        <div className="rounded-[20px] border border-line bg-white/80 p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <Lightbulb className="h-4 w-4 text-ink" strokeWidth={1.7} /> Tips
          </div>
          <ul className="mt-3.5 space-y-3">
            {DESCRIBE_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-soft">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="khoj-grain relative flex-1 overflow-hidden rounded-[20px] bg-gradient-to-b from-[#efede8] to-[#e2dfd7] p-5 min-h-[190px]">
          {/* detective sketch */}
          <svg viewBox="0 0 200 150" className="mx-auto mt-2 h-32 text-ink/80" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <circle cx="118" cy="42" r="16" />
            <path d="M104 36c4-6 10-9 16-8" />
            <path d="M128 52c8 4 14 12 16 22" />
            <path d="M108 54c-8 6-13 16-14 28" />
            <path d="M96 118c2-16 10-30 24-36" />
            <path d="M144 60c6 2 12 1 16-2" />
            <path d="M150 74l14-10" strokeWidth="2" />
            <path d="M60 120c14-4 34-6 60-4" strokeWidth="2" />
          </svg>
          <div className="absolute bottom-4 right-5 text-right">
            <HandNote size={20} rotate={-6} className="text-ink/85">
              People
              <br />
              find people.
            </HandNote>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

/* =================== Step 2 — Review =================== */
function ReviewStep() {
  const { findDescription, setFindStep } = useKhoj();
  const fields = extractedFor(findDescription);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [extra, setExtra] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
        Did we get this right?
      </h1>
      <p className="mt-2.5 text-[13.5px] text-ink-soft">
        Here&apos;s what we understand from your description. You can edit anything.
      </p>

      <div className="mt-7 grid gap-6 rounded-[24px] border border-line bg-white/80 p-6 sm:grid-cols-[190px_1fr] sm:p-7">
        <div>
          <div className="relative">
            <PersonPhoto
              photo="/images/portrait-ramesh.jpg"
              name="Ramesh Kumar"
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
            <span className="absolute left-3 top-3 rounded-full bg-match-green px-2.5 py-1 text-[11px] font-semibold text-match-green-text">
              Best match
            </span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-faint">
            <FileImage className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Reference image assembled from records. You can attach a photo later.
          </p>
        </div>

        <div className="divide-y divide-line/80">
          {fields.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="text-[12px] text-ink-faint">{f.label}</div>
              <div className="flex flex-1 items-center justify-end gap-3 text-right">
                <span className="text-[13px] font-medium text-ink">
                  {edits[f.key] ?? f.value}
                </span>
                <button
                  onClick={() => {
                    const v = window.prompt(`Edit ${f.label.toLowerCase()}`, edits[f.key] ?? f.value);
                    if (v !== null) setEdits((p) => ({ ...p, [f.key]: v }));
                  }}
                  className="text-[11.5px] font-medium text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
                >
                  (Edit)
                </button>
              </div>
            </motion.div>
          ))}

          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center justify-between gap-3 py-3"
            >
              <input
                autoFocus
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Add a detail — language, marks, habit…"
                className="w-full rounded-lg border border-line-2 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-ink/40"
              />
              <button
                onClick={() => {
                  if (extra.trim()) setEdits((p) => ({ ...p, extra: extra.trim() }));
                  setAdding(false);
                  setExtra("");
                }}
                className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[11.5px] text-[#f4f2ee]"
              >
                Add
              </button>
            </motion.div>
          )}

          {edits.extra && !adding && (
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="text-[12px] text-ink-faint">More</div>
              <span className="text-[13px] font-medium">{edits.extra}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-5 py-2.5 text-[12.5px] font-medium transition-all hover:border-ink/40"
        >
          + Add more details
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFindStep(0)}
            className="text-[13px] text-ink-soft transition-colors hover:text-ink"
          >
            ← Back
          </button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFindStep(2)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-colors hover:bg-black"
          >
            Looks correct <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* =================== Step 3 — Agentic search =================== */
function SearchStep() {
  const { searchProgress, setSearchProgress, setFindStep } = useKhoj();

  useEffect(() => {
    if (searchProgress >= SEARCH_TASKS.length) {
      const t = setTimeout(() => setFindStep(3), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSearchProgress(searchProgress + 1), 1300);
    return () => clearTimeout(t);
  }, [searchProgress, setSearchProgress, setFindStep]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        {/* detective illustration */}
        <motion.svg
          viewBox="0 0 200 150"
          className="h-36 text-ink/85"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          aria-hidden
        >
          <motion.circle cx="118" cy="42" r="16" />
          <path d="M104 36c4-6 10-9 16-8" />
          <path d="M128 52c8 4 14 12 16 22" />
          <path d="M108 54c-8 6-13 16-14 28" />
          <path d="M96 118c2-16 10-30 24-36" />
          <path d="M144 60c6 2 12 1 16-2" />
          <motion.path
            d="M150 74l14-10"
            strokeWidth="2"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
          <path d="M60 120c14-4 34-6 60-4" strokeWidth="2" />
        </motion.svg>

        <h1 className="mt-6 text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
          Khoj is investigating...
        </h1>
        <p className="mx-auto mt-2.5 max-w-[440px] text-[13.5px] leading-relaxed text-ink-soft">
          Our AI is searching across government databases, NGOs, public records and
          other sources.
        </p>

        <div className="mt-8 w-full max-w-[430px] space-y-3 text-left">
          {SEARCH_TASKS.map((task, i) => {
            const done = searchProgress > i;
            const active = searchProgress === i;
            return (
              <div key={task} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    done && "border-ink bg-ink text-[#f4f2ee]",
                    active && "border-ink/40",
                    !done && !active && "border-line-2"
                  )}
                >
                  {done && <Check className="h-3 w-3" strokeWidth={3} />}
                  {active && (
                    <Loader2 className="h-3 w-3 animate-spin text-ink" strokeWidth={2.4} />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[13px] transition-colors duration-300",
                    done ? "text-ink" : active ? "text-ink-2" : "text-ink-faint"
                  )}
                >
                  {task}
                  {done && i === 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-2 text-[11px] text-match-green-text"
                    >
                      done
                    </motion.span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-[11.5px] text-ink-faint">
          This usually takes a few moments.
        </p>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="flex flex-col gap-4"
      >
        <div className="rounded-[20px] border border-line bg-white/80 p-5">
          <div className="text-[13px] font-semibold">Searching across</div>
          <ul className="mt-3.5 space-y-3.5">
            {SEARCH_SOURCES.map((s) => {
              const Icon = SOURCE_ICONS[s.icon];
              return (
                <li key={s.label} className="flex items-center gap-2.5 text-[12.5px] text-ink-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.05]">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                  </span>
                  {s.label}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative flex-1 rounded-[20px] border border-line bg-white/50 p-5 min-h-[120px]">
          <div className="absolute bottom-4 right-5 text-right">
            <HandNote size={21} rotate={-5} className="text-ink/85">
              A safer
              <br />
              brighter India.
            </HandNote>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

/* =================== Wrapper =================== */
export default function FindSomeone() {
  const { findStep, setFindStep } = useKhoj();

  return (
    <AppShell active="find">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-8 flex items-center justify-between">
          <Stepper
            steps={SEARCH_STEPS}
            current={findStep}
            onStepClick={(i) => i <= findStep && setFindStep(i)}
          />
          {findStep > 0 && findStep < 3 && (
            <button
              onClick={() => setFindStep(findStep - 1)}
              className="flex items-center gap-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={findStep}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.21, 0.65, 0.35, 1] }}
          >
            {findStep === 0 && <DescribeStep />}
            {findStep === 1 && <ReviewStep />}
            {findStep === 2 && <SearchStep />}
            {findStep === 3 && <FindResults />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

/* Results rendered from store data */
function FindResults() {
  const openCase = useKhoj((s) => s.openCase);
  const [sortDesc, setSortDesc] = useState(true);
  const [minMatch, setMinMatch] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const list = [...MATCH_PEOPLE]
    .filter((p) => p.match >= minMatch)
    .sort((a, b) => (sortDesc ? b.match - a.match : a.match - b.match));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
            We found {list.length} possible matches.
          </h1>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            Review the results below. Check details and contact the relevant authority.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12.5px] font-medium transition-all",
              showFilters ? "border-ink bg-ink text-[#f4f2ee]" : "border-line-2 bg-white hover:border-ink/40"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </button>
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-4 py-2.5 text-[12.5px] font-medium transition-all hover:border-ink/40"
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/70 p-4">
              <span className="text-[12px] text-ink-faint">Minimum match:</span>
              {[0, 40, 50, 60, 70].map((m) => (
                <button
                  key={m}
                  onClick={() => setMinMatch(m)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                    minMatch === m ? "bg-ink text-[#f4f2ee]" : "border border-line-2 text-ink-soft hover:border-ink/40"
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
            transition={{ delay: i * 0.07, duration: 0.45 }}
            whileHover={{ y: -2 }}
            className="group flex flex-col gap-4 rounded-[20px] border border-line bg-white/80 p-4 transition-all hover:border-ink/25 hover:shadow-[0_18px_40px_-24px_rgba(20,19,17,0.4)] sm:flex-row sm:items-center"
          >
            <PersonPhoto
              photo={p.photo}
              name={p.name}
              className="h-[74px] w-[74px] shrink-0 rounded-2xl object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <MatchBadge pct={p.match} />
                <span className="text-[14.5px] font-semibold tracking-tight">{p.name}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-ink/[0.06] text-[8px] font-bold">
                    {p.gender[0]}
                  </span>
                  {p.gender} · {p.age}
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
                className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white px-4 py-2 text-[12px] font-medium transition-all hover:border-ink hover:bg-ink hover:text-[#f4f2ee]"
              >
                View details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => useKhoj.getState().setFindStep(2)}
          className="text-[13px] text-ink-soft transition-colors hover:text-ink"
        >
          ← Run search again
        </button>
        <button
          onClick={() => useKhoj.getState().navigate("dashboard")}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-[#f4f2ee] transition-colors hover:bg-black"
        >
          Back to dashboard <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

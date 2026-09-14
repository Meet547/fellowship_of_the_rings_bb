"use client";

import { cn } from "@/lib/utils";
import { AppShell } from "@/components/khoj/app-shell";
import { MockCheck } from "@/components/khoj/primitives";
import {
  EXTRACTED_CASE,
  PIPELINE_STAGES,
  RESULT_LEADS,
  RESULT_STATS,
  SAMPLE_DESCRIPTION,
  STAGE_GAP,
  type PipelineStage,
  type ResultLead,
} from "@/lib/pipeline-data";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardList,
  GitCompare,
  ListOrdered,
  Loader2,
  MessagesSquare,
  Mic,
  RotateCcw,
  Search,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

type Phase = "intake" | "running" | "done";
type TaskState = "pending" | "running" | "done";

const STAGE_ICONS = [ClipboardList, Search, GitCompare, ListOrdered];

const fmt = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function StatusChip({ state }: { state: "queued" | "running" | "complete" }) {
  const cls =
    state === "running"
      ? "bg-accent-soft text-accent-deep"
      : state === "complete"
        ? "bg-[#e9f7ef] text-success"
        : "bg-lav-chip text-faint";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]",
        cls
      )}
    >
      {state === "running" && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-accent"
        />
      )}
      {state === "complete" && <Check className="h-3 w-3" strokeWidth={2.6} />}
      {state === "queued" ? "Queued" : state === "running" ? "Running" : "Complete"}
    </span>
  );
}

function TaskBullet({
  state,
  label,
  detail,
  index,
}: {
  state: TaskState;
  label: string;
  detail?: string;
  index: number;
}) {
  return (
    <motion.li
      initial={false}
      animate={{ opacity: state === "pending" ? 0 : 1, y: state === "pending" ? 8 : 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: state === "pending" ? 0 : index * 0.02 }}
      className="flex items-center gap-3 py-[7px]"
      aria-hidden={state === "pending"}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        {state === "done" && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 24 }}
            className="flex"
          >
            <MockCheck className="h-[18px] w-[18px]" />
          </motion.span>
        )}
        {state === "running" && (
          <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={2.4} />
        )}
        {state === "pending" && <span className="h-[18px] w-[18px] rounded-full border border-linec" />}
      </span>
      <span
        className={cn(
          "flex-1 text-[14.5px]",
          state === "done" ? "text-ink" : state === "running" ? "text-ink" : "text-body"
        )}
      >
        {label}
      </span>
      <AnimatePresence>
        {state === "done" && detail && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="whitespace-nowrap text-[12px] font-medium text-faint"
          >
            {detail}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function AgentCard({
  stage,
  state,
  tasksDone,
  innerRef,
}: {
  stage: PipelineStage;
  state: "running" | "done";
  tasksDone: number;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const Icon = STAGE_ICONS[PIPELINE_STAGES.findIndex((s) => s.id === stage.id)];
  return (
    <div
      ref={innerRef}
      className="scroll-mt-32 rounded-2xl border border-linec bg-surface p-5 shadow-[0_8px_28px_rgba(24,22,35,0.05)] sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-linec bg-white">
          <Icon className="h-[18px] w-[18px] text-accent" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-[16.5px] font-medium tracking-[-0.01em] text-ink">
              {stage.agent}
            </h3>
            <span className="rounded-full border border-linec bg-lav-chip px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
              {stage.engine}
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-body">{stage.goal}</p>
        </div>
        <StatusChip state={state === "running" ? "running" : "complete"} />
      </div>

      <ul className="mt-3 border-t border-linec/70 pt-2">
        {stage.tasks.map((task, i) => (
          <TaskBullet
            key={task.id}
            index={i}
            label={task.label}
            detail={task.detail}
            state={
              i < tasksDone ? "done" : i === tasksDone && state === "running" ? "running" : "pending"
            }
          />
        ))}
      </ul>
    </div>
  );
}

function CaseSummaryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="rounded-2xl border border-linline bg-lav-deep/60 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white">
          Case #{EXTRACTED_CASE.caseNo}
        </span>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-flag">
          {EXTRACTED_CASE.status}
        </span>
        <span className="text-[12px] text-body">Extracted from your description</span>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {EXTRACTED_CASE.fields.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-linline/70 pb-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              {f.label}
            </dt>
            <dd className="text-right text-[14px] font-medium text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const r = 26;
  const C = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e4ee" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#556aec"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[17px] font-semibold tracking-[-0.02em] text-ink">
        {score}
        <span className="mt-[3px] text-[10px] font-medium text-faint">%</span>
      </span>
    </div>
  );
}

function EvidenceRow({ check }: { check: ResultLead["checks"][number] }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-linec/70 py-2 last:border-0">
      <span className="w-[86px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
        {check.field}
      </span>
      <span className="flex-1 truncate text-right text-[13px] text-body">{check.caseValue}</span>
      <ArrowRight className="h-3 w-3 shrink-0 text-diagram" strokeWidth={2} />
      <span
        className={cn(
          "max-w-[45%] flex-1 truncate text-[13px] font-medium",
          check.ok ? "text-ink" : "text-flag"
        )}
      >
        {check.matchValue}
      </span>
      {check.ok ? (
        <MockCheck className="h-4 w-4 shrink-0" />
      ) : (
        <TriangleAlert className="h-4 w-4 shrink-0 text-flag" strokeWidth={2} />
      )}
    </div>
  );
}

function CompactLead({ lead }: { lead: ResultLead }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col rounded-2xl border border-linec bg-surface p-5 shadow-[0_6px_20px_rgba(24,22,35,0.04)]">
      <div className="flex items-start gap-4">
        <ScoreRing score={lead.score} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">{lead.title}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                lead.confidence === "medium"
                  ? "bg-accent-soft text-accent-deep"
                  : "bg-lav-chip text-faint"
              )}
            >
              {lead.confidence}
            </span>
          </div>
          <p className="mt-0.5 text-[12.5px] text-faint">
            {lead.place} · {lead.date}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-body">{lead.summary}</p>
        </div>
      </div>

      {lead.flag && (
        <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-[#fdf3e3] px-2.5 py-1 text-[11.5px] font-medium text-flag">
          <TriangleAlert className="h-3 w-3" strokeWidth={2.2} />
          {lead.flag}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-linec bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-[#cfcddd]"
      >
        {open ? "Hide evidence" : "View evidence"}
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {lead.checks.map((c) => (
                <EvidenceRow key={c.field} check={c} />
              ))}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lead.sources.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-lav-chip px-2.5 py-1 text-[11.5px] font-medium text-body"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function PipelineInner() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("intake");
  const [description, setDescription] = React.useState(SAMPLE_DESCRIPTION);
  const [intakeError, setIntakeError] = React.useState("");
  const [dictating, setDictating] = React.useState(false);
  const [stageIdx, setStageIdx] = React.useState(0);
  const [tasksDone, setTasksDone] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [stageTimes, setStageTimes] = React.useState<Record<number, number>>({});

  const elapsedRef = React.useRef(0);
  const dictTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const activeCardRef = React.useRef<HTMLDivElement>(null);

  /* --- dictation (mock Whisper transcription, typed into the textarea) --- */
  React.useEffect(() => {
    return () => {
      if (dictTimer.current) clearInterval(dictTimer.current);
    };
  }, []);

  const dictate = () => {
    if (dictating || phase !== "intake") return;
    setIntakeError("");
    setDictating(true);
    setDescription("");
    const text = SAMPLE_DESCRIPTION;
    let i = 0;
    dictTimer.current = setInterval(() => {
      i += 2;
      setDescription(text.slice(0, i));
      if (i >= text.length) {
        if (dictTimer.current) clearInterval(dictTimer.current);
        dictTimer.current = null;
        setTimeout(() => setDictating(false), 260);
      }
    }, 22);
  };

  /* --- elapsed clock ------------------------------------------------------ */
  React.useEffect(() => {
    if (phase !== "running") return;
    const iv = setInterval(() => {
      elapsedRef.current += 100;
      setElapsed(elapsedRef.current);
    }, 100);
    return () => clearInterval(iv);
  }, [phase]);

  /* --- the agent run ------------------------------------------------------ */
  React.useEffect(() => {
    if (phase !== "running") return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runStage = (si: number) => {
      if (cancelled) return;
      setStageIdx(si);
      setTasksDone(0);
      const stage = PIPELINE_STAGES[si];
      let t = 0;
      stage.tasks.forEach((task, ti) => {
        t += task.duration;
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setTasksDone(ti + 1);
          }, t)
        );
      });
      timers.push(
        setTimeout(
          () => {
            if (cancelled) return;
            setStageTimes((prev) => ({ ...prev, [si]: elapsedRef.current }));
            if (si + 1 < PIPELINE_STAGES.length) runStage(si + 1);
            else setPhase("done");
          },
          t + STAGE_GAP
        )
      );
    };

    runStage(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [phase]);

  /* --- keep the active agent in view -------------------------------------- */
  React.useEffect(() => {
    if (phase !== "running") return;
    activeCardRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [stageIdx, phase, reduce]);

  const startInvestigation = async () => {
    if (description.trim().length < 30) {
      setIntakeError("Add a little more detail — a few sentences about who, where and when.");
      return;
    }
    setIntakeError("");
    try {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to start the investigation.");
    } catch (error) {
      setIntakeError(
        error instanceof Error ? error.message : "Unable to start the investigation.",
      );
      return;
    }
    elapsedRef.current = 0;
    setElapsed(0);
    setStageTimes({});
    setStageIdx(0);
    setTasksDone(0);
    setPhase("running");
  };

  const resetAll = () => {
    setPhase("intake");
    setDescription(SAMPLE_DESCRIPTION);
    setStageIdx(0);
    setTasksDone(0);
    setElapsed(0);
    setStageTimes({});
  };

  /* ------------------------------------------------------------------ */
  /*  INTAKE                                                             */
  /* ------------------------------------------------------------------ */
  if (phase === "intake") {
    return (
      <AppShell>
        <div className="mx-auto max-w-[760px]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              New investigation
            </p>
            <h1 className="mt-2 text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-ink md:text-[38px]">
              Describe who you&rsquo;re looking for.
            </h1>
            <p className="mt-3 max-w-[560px] text-[16px] leading-[1.6] text-body">
              Write it the way you&rsquo;d tell a friend — names, places, times,
              what they were wearing. KHOJ&rsquo;s agents take it from there.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
            className="mt-7 rounded-2xl border border-linec bg-surface p-5 shadow-[0_8px_28px_rgba(24,22,35,0.05)] sm:p-6"
          >
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                aria-label="Case description"
                placeholder="My brother is 17 and was last seen near…"
                className="w-full resize-none rounded-xl border border-linec bg-white p-4 text-[15px] leading-[1.65] text-ink placeholder:text-faint/80 focus:border-accent/50 focus:outline-none focus:ring-[3px] focus:ring-accent/15"
              />
              {dictating && (
                <span className="caret-blink pointer-events-none absolute bottom-4 right-4 text-[13px] text-accent">
                  ▍
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={dictate}
                disabled={dictating}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border border-linec bg-white px-4 text-[13.5px] font-medium text-ink transition-colors hover:border-[#cfcddd] disabled:cursor-default",
                  dictating && "mic-live border-accent/40"
                )}
              >
                <Mic className={cn("h-4 w-4", dictating ? "text-accent" : "text-body")} strokeWidth={2} />
                {dictating ? "Listening…" : "Dictate instead"}
              </button>
              {dictating && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-accent-deep">
                  <span className="flex items-end gap-[2px]" aria-hidden="true">
                    {[0, 1, 2].map((b) => (
                      <span
                        key={b}
                        className="wave-bar h-2.5 w-[2.5px] rounded-full bg-accent"
                        style={{ animationDelay: `${b * 0.14}s` }}
                      />
                    ))}
                  </span>
                  Whisper · transcribing
                </span>
              )}
            </div>

            <AnimatePresence initial={false}>
              {intakeError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-3 text-[12.5px] text-[#b3261e]"
                >
                  {intakeError}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-linec/70 pt-5">
              <p className="text-[12px] leading-relaxed text-faint">
                Demo investigation — runs on sample data.
                <br className="sm:hidden" /> No real records are searched.
              </p>
              <button
                type="button"
                onClick={startInvestigation}
                disabled={dictating}
                className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(24,22,35,0.18)] transition-all hover:bg-accent-deep active:scale-[0.99] disabled:opacity-60"
              >
                Start investigation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  RUNNING                                                            */
  /* ------------------------------------------------------------------ */
  const stage = PIPELINE_STAGES[stageIdx];
  const mobileStage = (si: number) => (si < stageIdx || phase === "done" ? "done" : si === stageIdx ? "active" : "queued");

  if (phase === "running") {
    return (
      <AppShell>
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              Agentic investigation
            </p>
            <h1 className="mt-2 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink md:text-[30px]">
              Four agents are working your case
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-linec bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-body">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" strokeWidth={2.4} />
            <span className="font-mono text-[12px] tabular-nums text-ink">{fmt(elapsed)}</span>
          </span>
        </div>

        {/* segmented progress */}
        <div className="mt-6 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {PIPELINE_STAGES.map((s, si) => {
            const fill =
              si < stageIdx
                ? "100%"
                : si === stageIdx
                  ? `${Math.min(100, (tasksDone / s.tasks.length) * 100)}%`
                  : "0%";
            return (
              <div key={s.id} className="h-1 overflow-hidden rounded-full bg-linec">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={false}
                  animate={{ width: fill }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[290px_1fr] lg:gap-10">
          {/* stepper — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                Pipeline
              </p>
              <ol className="mt-4 space-y-0">
                {PIPELINE_STAGES.map((s, si) => {
                  const st = mobileStage(si);
                  return (
                    <li key={s.id} className="relative flex gap-3.5 pb-7 last:pb-0">
                      {si < PIPELINE_STAGES.length - 1 && (
                        <span
                          className={cn(
                            "absolute left-[13px] top-8 h-[calc(100%-28px)] w-px",
                            st === "done" ? "bg-success/40" : "bg-linec"
                          )}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          "flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                          st === "done" && "border-success/30 bg-[#e9f7ef] text-success",
                          st === "active" && "border-accent bg-accent text-white",
                          st === "queued" && "border-linec bg-white text-faint"
                        )}
                      >
                        {st === "done" ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
                        ) : (
                          s.index
                        )}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p
                          className={cn(
                            "text-[14px] font-medium",
                            st === "queued" ? "text-faint" : "text-ink"
                          )}
                        >
                          {s.agent}
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-body">{s.goal}</p>
                        <p className="mt-1 text-[11.5px] font-medium text-faint">
                          {st === "done"
                            ? `Complete · ${fmt(stageTimes[si] ?? 0)}`
                            : st === "active"
                              ? "Running…"
                              : "Queued"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          {/* main column */}
          <div>
            {/* compact stage pills — mobile */}
            <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto lg:hidden">
              {PIPELINE_STAGES.map((s, si) => {
                const st = mobileStage(si);
                return (
                  <span
                    key={s.id}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium",
                      st === "done" && "bg-[#e9f7ef] text-success",
                      st === "active" && "bg-accent text-white",
                      st === "queued" && "bg-lav-chip text-faint"
                    )}
                  >
                    {st === "done" && <Check className="h-3 w-3" strokeWidth={2.8} />}
                    {s.agent}
                  </span>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage.id}
                ref={activeCardRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="scroll-mt-32"
              >
                <AgentCard stage={stage} state="running" tasksDone={tasksDone} />
              </motion.div>
            </AnimatePresence>

            {stageIdx >= 1 && (
              <div className="mt-5">
                <CaseSummaryCard />
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  DONE — results                                                     */
  /* ------------------------------------------------------------------ */
  const [lead1, lead2, lead3] = RESULT_LEADS;

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              Agentic investigation
            </p>
            <h1 className="mt-2 text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-ink md:text-[34px]">
              Investigation complete.
            </h1>
            <p className="mt-2.5 max-w-[540px] text-[15.5px] leading-[1.6] text-body">
              {RESULT_STATS.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(" · ")}.
              Every lead cites its evidence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f7ef] px-3 py-1.5 text-[12.5px] font-medium text-success">
              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              Completed in {fmt(elapsed)}
            </span>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-linec bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-[#cfcddd]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-body" strokeWidth={2} />
              Run again
            </button>
          </div>
        </div>
      </motion.div>

      {/* featured lead */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5, ease: EASE }}
        className="mt-8 rounded-2xl border border-linec bg-surface p-5 shadow-[0_10px_32px_rgba(24,22,35,0.06)] sm:p-7"
      >
        <div className="grid gap-7 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-5 lg:flex-col lg:items-start">
            <ScoreRing score={lead1.score} />
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
              High confidence
            </span>
          </div>
          <div>
            <h2 className="text-[19px] font-medium tracking-[-0.015em] text-ink">
              {lead1.title}
            </h2>
            <p className="mt-1 text-[13px] text-faint">
              {lead1.place} · {lead1.date}
            </p>
            <p className="mt-2.5 max-w-[620px] text-[14.5px] leading-relaxed text-body">
              {lead1.summary}
            </p>

            <div className="mt-5 grid gap-x-10 md:grid-cols-2">
              {lead1.checks.map((c) => (
                <EvidenceRow key={c.field} check={c} />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {lead1.sources.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-lav-chip px-2.5 py-1 text-[11.5px] font-medium text-body"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/chat"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[14.5px] font-medium text-white shadow-[0_1px_2px_rgba(24,22,35,0.18)] transition-colors hover:bg-accent-deep"
              >
                <MessagesSquare className="h-4 w-4" strokeWidth={2} />
                Ask KHOJ about this lead
              </Link>
              <span className="text-[12px] text-faint">
                Grounded answers, cited to the case file.
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* secondary leads */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {[lead2, lead3].map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + i * 0.1, duration: 0.5, ease: EASE }}
          >
            <CompactLead lead={lead} />
          </motion.div>
        ))}
      </div>

      {/* chat banner */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5, ease: EASE }}
        className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-linline bg-lav-deep/70 p-6 sm:p-7"
      >
        <div className="max-w-[520px]">
          <h2 className="text-[19px] font-medium tracking-[-0.015em] text-ink">
            Have questions about these leads?
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-body">
            Talk it through with KHOJ — ask why a lead scored the way it did, or
            what to do next. Voice input supported.
          </p>
        </div>
        <Link
          href="/chat"
          className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#2a2740]"
        >
          Open case chat
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
      </motion.div>

      <p className="mt-6 text-center text-[12px] text-faint">
        A potential match is not a confirmed identity — verify before acting.
      </p>
    </AppShell>
  );
}

export default function PipelinePage() {
  return <PipelineInner />;
}

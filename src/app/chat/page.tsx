"use client";

import { cn } from "@/lib/utils";
import { AppShell } from "@/components/khoj/app-shell";
import { KhojMark, MockCheck } from "@/components/khoj/primitives";
import { SUGGESTED_PROMPTS, VOICE_SAMPLES, WHISPER_DELAY } from "@/lib/chat-engine";
import { EXTRACTED_CASE } from "@/lib/pipeline-data";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, FileText, Mic, Sparkles, X } from "lucide-react";
import * as React from "react";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

/* Case chat — streaming replies + Whisper-style voice input (demo). */

interface Msg {
  id: number;
  role: "user" | "assistant";
  text: string;
  cites?: string[];
  streaming?: boolean;
}

type WhisperState = "recording" | "transcribing" | "done";

let nextId = 1;

/* -------------------------------------------------------------------------- */
/*  Typing indicator                                                          */
/* -------------------------------------------------------------------------- */

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex items-center gap-3"
    >
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-linec bg-white px-4 py-3.5">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            animate={{ y: [0, -3.5, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15, ease: "easeInOut" }}
            className="h-[5px] w-[5px] rounded-full bg-body"
          />
        ))}
      </div>
    </motion.div>
  );
}

function AssistantAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-linec bg-white shadow-[0_1px_2px_rgba(24,22,35,0.06)]">
      <KhojMark className="h-[15px] w-[15px] text-accent" strokeWidth={2} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function ChatInner() {
  /* Session is enforced by AppShell (single guard) — children mount only
     after the session resolves, so refs/effects below run at the right time. */
  const reduce = useReducedMotion();

  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);

  const [listening, setListening] = React.useState(false);
  const [whisper, setWhisper] = React.useState<WhisperState>("recording");
  const [transcript, setTranscript] = React.useState("");

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);
  const voiceTimers = React.useRef<(ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[]>([]);
  const voiceIdx = React.useRef(0);

  /* Callback ref — runs exactly when the composer mounts (post-guard),
     sets the compact placeholder and the initial auto-sized height. */
  const attachTa = React.useCallback((el: HTMLTextAreaElement | null) => {
    taRef.current = el;
    if (!el) return;
    const applyCompact = () => {
      const compactQuery = window.matchMedia("(max-width: 640px)");
      el.dataset.compact = compactQuery.matches ? "1" : "0";
      el.placeholder = compactQuery.matches
        ? "Ask about this case…"
        : "Ask about the evidence, timeline or leads…";
    };
    applyCompact();
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, []);

  /* Auto-resize as the user types + keep the placeholder responsive. */
  React.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    const compact = el.dataset.compact === "1";
    el.placeholder = streaming
      ? "KHOJ is responding…"
      : compact
        ? "Ask about this case…"
        : "Ask about the evidence, timeline or leads…";
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input, streaming]);

  /* keep latest message in view */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, thinking, reduce]);

  React.useEffect(() => {
    const timers = voiceTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Send + stream                                                      */
  /* ------------------------------------------------------------------ */
  const send = React.useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || streaming || listening) return;

      const userId = nextId++;
      setMessages((m) => [...m, { id: userId, role: "user", text }]);
      setInput("");
      setThinking(true);
      setStreaming(true);

      let reply: { text: string; cites?: string[] };
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const payload = (await response.json()) as {
          text?: string;
          cites?: string[];
          error?: string;
        };
        if (!response.ok || !payload.text) {
          throw new Error(payload.error || "Unable to answer that question.");
        }
        reply = { text: payload.text, cites: payload.cites };
      } catch {
        setThinking(false);
        setStreaming(false);
        setMessages((m) => [
          ...m,
          {
            id: nextId++,
            role: "assistant",
            text: "I couldn't reach the case service. Please try that question again.",
          },
        ]);
        return;
      }

      const words = reply.text.split(" ");
      const replyId = nextId++;

      const start = setTimeout(() => {
        setThinking(false);
        setMessages((m) => [
          ...m,
          { id: replyId, role: "assistant", text: "", cites: reply.cites, streaming: true },
        ]);
        let wi = 0;
        const iv = setInterval(() => {
          wi += 2;
          const slice = words.slice(0, wi).join(" ");
          setMessages((m) =>
            m.map((msg) => (msg.id === replyId ? { ...msg, text: slice } : msg))
          );
          if (wi >= words.length) {
            clearInterval(iv);
            setMessages((m) =>
              m.map((msg) => (msg.id === replyId ? { ...msg, streaming: false } : msg))
            );
            setStreaming(false);
          }
        }, 24);
        voiceTimers.current.push(iv);
      }, 560);
      voiceTimers.current.push(start);
    },
    [streaming, listening]
  );

  /* ------------------------------------------------------------------ */
  /*  Voice — mock Whisper transcription                                 */
  /* ------------------------------------------------------------------ */
  const cancelVoice = React.useCallback(() => {
    voiceTimers.current.forEach(clearTimeout);
    voiceTimers.current = [];
    setListening(false);
    setWhisper("recording");
    setTranscript("");
  }, []);

  const startVoice = () => {
    if (listening || streaming) return;
    setListening(true);
    setWhisper("recording");
    setTranscript("");

    const sample = VOICE_SAMPLES[voiceIdx.current % VOICE_SAMPLES.length];
    voiceIdx.current += 1;

    const begin = setTimeout(() => {
      setWhisper("transcribing");
      let i = 0;
      const iv = setInterval(() => {
        i += 1;
        setTranscript(sample.slice(0, i));
        if (i >= sample.length) {
          clearInterval(iv);
          setWhisper("done");
          const finish = setTimeout(() => {
            setListening(false);
            setWhisper("recording");
            setTranscript("");
            send(sample);
          }, 620);
          voiceTimers.current.push(finish);
        }
      }, 32);
      voiceTimers.current.push(iv);
    }, WHISPER_DELAY);
    voiceTimers.current.push(begin);
  };

  const empty = messages.length === 0;

  return (
    <AppShell width="narrow" next="/chat">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
            Case chat
          </p>
          <h1 className="mt-2 flex flex-wrap items-center gap-2.5 text-[24px] font-medium leading-[1.15] tracking-[-0.02em] text-ink md:text-[28px]">
            Ask about this case
            <span className="rounded-full bg-lav-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-body">
              #{EXTRACTED_CASE.caseNo} · {EXTRACTED_CASE.fields[0].value}
            </span>
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-linec bg-surface px-3 py-1.5 text-[11px] font-medium text-faint">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
          Whisper · voice input
        </span>
      </div>

      {/* thread */}
      <div
        ref={scrollRef}
        className="no-scrollbar mt-6 flex h-[56vh] min-h-[380px] flex-col gap-5 overflow-y-auto pb-2"
        aria-live="polite"
      >
        {empty && (
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-linec bg-white shadow-[0_6px_20px_rgba(24,22,35,0.05)]"
            >
              <KhojMark className="h-7 w-7 text-accent" strokeWidth={1.8} />
            </motion.div>
            <h2 className="mt-4 text-[19px] font-medium tracking-[-0.015em] text-ink">
              I&rsquo;ve read the full case file.
            </h2>
            <p className="mt-1.5 max-w-[400px] text-[14px] leading-relaxed text-body">
              Ask about the timeline, why a lead scored the way it did, or what
              to do next — or hold the mic and just talk.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((p, i) => (
                <motion.button
                  key={p}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: EASE }}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-linec bg-white px-3.5 py-2 text-[13px] font-medium text-body transition-all hover:border-accent/40 hover:text-ink"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) =>
            msg.role === "user" ? (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex justify-end"
              >
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-4 py-3 text-[15px] leading-[1.6] text-white shadow-[0_2px_8px_rgba(85,106,236,0.25)]">
                  {msg.text}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex items-start gap-3"
              >
                <AssistantAvatar />
                <div className="min-w-0 max-w-[88%]">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                    KHOJ
                  </p>
                  <div className="rounded-2xl rounded-tl-md border border-linec bg-white px-4 py-3 text-[15px] leading-[1.65] text-ink">
                    {msg.text}
                    {msg.streaming && (
                      <span className="caret-blink ml-0.5 inline-block text-accent">▍</span>
                    )}
                  </div>
                  {!msg.streaming && msg.cites && msg.cites.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="mt-2 flex flex-wrap gap-1.5"
                    >
                      {msg.cites.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 rounded-full bg-lav-chip px-2.5 py-1 text-[11.5px] font-medium text-body"
                        >
                          <FileText className="h-3 w-3 text-faint" strokeWidth={2} />
                          {c}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        <AnimatePresence>{thinking && <TypingBubble />}</AnimatePresence>
      </div>

      {/* composer */}
      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {listening ? (
            /* ------------------------- listening / transcribing bar */
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex items-center gap-3.5 rounded-2xl border border-accent/35 bg-white p-3 pl-4 shadow-[0_8px_28px_rgba(85,106,236,0.14)]"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white",
                  whisper === "recording" && "mic-live"
                )}
              >
                <Mic className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <span className="flex shrink-0 items-end gap-[3px]" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((b) => (
                  <span
                    key={b}
                    className="wave-bar h-4 w-[3px] rounded-full bg-accent/80"
                    style={{ animationDelay: `${b * 0.12}s` }}
                  />
                ))}
              </span>
              <p className="min-w-0 flex-1 truncate text-[14.5px] text-ink">
                {transcript ? (
                  <>
                    {transcript}
                    {whisper !== "done" && (
                      <span className="caret-blink ml-0.5 text-accent">▍</span>
                    )}
                  </>
                ) : (
                  <span className="text-body">Listening… speak now</span>
                )}
              </p>
              <AnimatePresence>
                {whisper === "done" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e9f7ef] px-2.5 py-1 text-[11px] font-semibold text-success"
                  >
                    <MockCheck className="h-3.5 w-3.5" />
                    Whisper
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={cancelVoice}
                aria-label="Cancel voice input"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:bg-lav hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </motion.div>
          ) : (
            /* ------------------------- normal composer */
            <motion.form
              key="composer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: EASE }}
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className={cn(
                "flex items-end gap-2 rounded-2xl border border-linec bg-white p-2 shadow-[0_6px_24px_rgba(24,22,35,0.05)] transition-shadow focus-within:border-accent/45 focus-within:shadow-[0_6px_24px_rgba(85,106,236,0.12)]",
                streaming && "opacity-90"
              )}
            >
              <button
                type="button"
                onClick={startVoice}
                disabled={streaming}
                aria-label="Start voice input"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-body transition-colors hover:bg-lav hover:text-accent disabled:opacity-40"
              >
                <Mic className="h-[18px] w-[18px]" strokeWidth={2} />
              </button>
              <textarea
                ref={attachTa}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                aria-label="Message KHOJ"
                className="max-h-[132px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-[1.5] text-ink focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-all hover:bg-accent-deep active:scale-95 disabled:cursor-default disabled:opacity-30"
              >
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-3 text-center text-[11.5px] leading-relaxed text-faint">
          Demo assistant — replies are generated from sample case data, grounded in
          the evidence. A potential match is not a confirmed identity.
        </p>
      </div>
    </AppShell>
  );
}

export default function ChatPage() {
  return <ChatInner />;
}

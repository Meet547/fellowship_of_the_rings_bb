"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ImageUp, Mic, Search } from "lucide-react";
import { useRef, useState } from "react";
import { Btn, ScriptNote, useToast } from "./ui";
import { EXAMPLE_QUERIES, SEARCH_TIPS } from "@/lib/khoj/data";
import type { Navigate } from "@/lib/khoj/router";

type Tab = "text" | "voice" | "photo";

export default function Find({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState<Tab>("text");
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const tabs: { id: Tab; label: string }[] = [
    { id: "text", label: "Text Search" },
    { id: "voice", label: "Voice Search" },
    { id: "photo", label: "Upload Photo" },
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-9">
      <h1 className="font-serif text-[26px] font-medium tracking-[-0.01em] text-ink">
        Find a Person
      </h1>
      <p className="mt-1.5 max-w-[600px] text-[13px] leading-relaxed text-ink2">
        Describe the person you are looking for. You can type, speak, or upload a photo.
        Our AI will search across government databases, news, and trusted sources.
      </p>

      <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {/* segmented tabs */}
          <div className="inline-flex rounded-[12px] border border-line bg-paper2 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative h-9 cursor-pointer rounded-[9px] px-4 text-[12.5px] font-medium transition-colors duration-300 ${
                  tab === t.id ? "text-ink" : "text-ink3 hover:text-ink2"
                }`}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="find-tab"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 -z-10 rounded-[9px] border border-line bg-card shadow-[0_4px_14px_-6px_rgba(35,32,27,0.25)]"
                  />
                )}
                {t.label}
              </button>
            ))}
          </div>

          {/* panel */}
          <div className="mt-4 rounded-[18px] border border-line bg-card p-6">
            <AnimatePresence mode="wait">
              {tab === "text" && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <textarea
                    value={query}
                    maxLength={300}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      'Describe the person... (e.g. "60-year old man, wearing white kurta, last seen in Lucknow")'
                    }
                    className="h-[120px] w-full resize-none bg-transparent text-[14px] leading-relaxed text-ink placeholder:text-ink3 focus:outline-none"
                  />
                  <div className="mt-3 flex items-center justify-between border-t border-line2 pt-4">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Voice input"
                        onClick={() => setTab("voice")}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-peach text-rust transition-all duration-300 hover:scale-105"
                      >
                        <Mic size={15} strokeWidth={1.9} />
                      </button>
                      <span className="text-[11px] text-ink3">{query.length}/300</span>
                    </div>
                    <Btn arrow onClick={() => navigate("searching")} disabled={query.trim().length === 0}>
                      Search Now
                    </Btn>
                  </div>
                </motion.div>
              )}

              {tab === "voice" && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex min-h-[168px] flex-col items-center justify-center text-center"
                >
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-rust/25 animate-pulse-ring" />
                    <button
                      aria-label="Start listening"
                      onClick={() => {
                        setListening((active) => !active);
                        toast(listening ? "Voice input paused." : "Listening… describe the person now.");
                      }}
                      className="relative flex size-16 cursor-pointer items-center justify-center rounded-full bg-peach text-rust transition-transform hover:scale-105 animate-breathe"
                    >
                      <Mic size={24} strokeWidth={1.7} />
                    </button>
                  </div>
                  <p className="mt-4 text-[13px] font-medium text-ink">{listening ? "Listening…" : "Tap to speak"}</p>
                  <p className="mt-1 text-[11.5px] text-ink3">
                    Describe the person in Hindi or English
                  </p>
                  {/* waveform */}
                  <div className="mt-4 flex h-6 items-center gap-[3px]">
                    {[10, 18, 26, 16, 24, 12, 20, 8].map((h, i) => (
                      <motion.span
                        key={i}
                        className="w-[3px] rounded-full bg-ink/25"
                        animate={{ height: [h, h * 0.4 + 4, h] }}
                        transition={{
                          duration: 1.1 + i * 0.09,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "photo" && (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="flex h-[168px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] border border-dashed border-ink/25 bg-paper2 transition-all duration-300 hover:border-rust/45 hover:bg-peach/25"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-card text-ink2 shadow-sm">
                      <ImageUp size={20} strokeWidth={1.7} />
                    </span>
                    <span className="text-[13px] font-medium text-ink">
                      Click to upload a photo
                    </span>
                    <span className="text-[11px] text-ink3">JPG or PNG, up to 10MB</span>
                  </button>
                  <input ref={fileInput} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(event) => {
                    if (event.target.files?.[0]) {
                      toast(`${event.target.files[0].name} selected. Ready to search.`);
                      setTab("text");
                    }
                  }} />
                  <div className="mt-4 flex justify-end border-t border-line2 pt-4">
                    <Btn arrow onClick={() => navigate("searching")}>
                      Search Now
                    </Btn>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* example queries */}
          <div className="mt-5">
            <div className="text-[12px] font-semibold text-ink">Example queries:</div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                    setTab("text");
                  }}
                  className="h-8 cursor-pointer rounded-full border border-line bg-card px-3.5 text-[11.5px] text-ink2 transition-all duration-300 hover:border-ink/35 hover:text-ink"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* tips */}
        <div className="rounded-[18px] border border-line bg-card p-5 lg:mt-[68px]">
          <div className="text-[13.5px] font-semibold text-ink">Search Tips</div>
          <ul className="mt-3.5 space-y-3">
            {SEARCH_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  strokeWidth={1.9}
                  className="mt-[1px] shrink-0 text-badgegt"
                />
                <span className="text-[12.5px] leading-relaxed text-ink2">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ScriptNote rotate={-4} className="mt-8 text-right text-[21px]">
        &ldquo;Har talaash kisi ghar tak&hellip;&rdquo;
      </ScriptNote>

      {/* hidden helper for icon tree-shake */}
      <span className="hidden">
        <Search size={0} />
      </span>
    </div>
  );
}

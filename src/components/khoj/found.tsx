"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  Btn,
  Field,
  Logo,
  ScriptNote,
  SelectInput,
  TextArea,
  TextInput,
  useToast,
} from "./ui";
import type { Navigate } from "@/lib/khoj/router";
import { ApiError, createFoundReport } from "@/lib/khoj/api";
import type { FoundReportPayload, FoundReportMatch } from "@/lib/khoj/api-types";

type Form = {
  name: string;
  age: string;
  gender: string;
  location: string;
  description: string;
  clothing: string;
  contact: string;
};

const EMPTY: Form = {
  name: "",
  age: "",
  gender: "",
  location: "",
  description: "",
  clothing: "",
  contact: "",
};

/** Trim a field; whitespace-only becomes undefined so it is never sent. */
function val(s: string): string | undefined {
  const t = s.trim();
  return t ? t : undefined;
}

function buildPayload(form: Form): FoundReportPayload {
  const payload: FoundReportPayload = {};
  const name = val(form.name);
  const age = val(form.age);
  const gender = val(form.gender);
  const location = val(form.location);
  const description = val(form.description);
  const clothing = val(form.clothing);
  const contact = val(form.contact);
  if (name) payload.name = name;
  if (age) payload.age = age;
  if (gender) payload.gender = gender;
  if (location) payload.location = location;
  if (description) payload.description = description;
  if (clothing) payload.clothing = clothing;
  if (contact) payload.contact = contact;
  return payload;
}

/** True when at least one descriptive/identifying field is present —
 *  mirrors the verified backend minimum (HTTP 400 otherwise). */
function hasIdentifyingDetail(p: FoundReportPayload): boolean {
  return Boolean(
    p.description || p.name || p.clothing || p.location || p.age,
  );
}

/* ── potential-match rendering (similarity, not identity) ──────────────── */

/** Evidence values that mean "field absent" — shown as nothing, not as text. */
const NON_EVIDENCE = new Set(["missing_candidate", "missing", ""]);

function MatchCard({ match }: { match: FoundReportMatch }) {
  const evidence: [string, string][] = [];
  const details = match.structured_details ?? {};
  for (const key of ["gender", "age", "clothing", "location"] as const) {
    const v = details[key];
    if (typeof v === "string" && !NON_EVIDENCE.has(v.trim().toLowerCase()))
      evidence.push([key, v]);
  }
  return (
    <div className="rounded-[14px] border border-line bg-paper2 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[13.5px] font-semibold text-ink">
            {match.name || "Unidentified person"}
          </div>
          <div className="mt-0.5 text-[12px] text-ink2">
            {[
              match.age,
              match.gender,
              match.last_seen_location,
            ]
              .filter(Boolean)
              .join(" · ") || "No details recorded"}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-badgeg px-2.5 py-1 text-[11px] font-semibold text-badgegt">
          Potential Match
        </span>
      </div>
      {(match.description || match.distinctive_marks) && (
        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink2">
          {match.description || match.distinctive_marks}
        </p>
      )}
      {evidence.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {evidence.map(([k, v]) => (
            <span
              key={k}
              className="rounded-[6px] border border-line bg-card px-2 py-0.5 text-[10.5px] capitalize text-ink2"
            >
              {k}: {v}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink3">
        <span>Match Score {Math.round(match.final_score)}%</span>
        <span>Missing-person report</span>
      </div>
    </div>
  );
}

export default function Found({ navigate }: { navigate: Navigate }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    found_id: string;
    matches: FoundReportMatch[];
  } | null>(null);
  const toast = useToast();

  const set =
    (k: keyof Form) =>
    (e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const reset = () => {
    setForm(EMPTY);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (submitting) return; // duplicate-click guard
    const payload = buildPayload(form);
    if (!hasIdentifyingDetail(payload)) {
      toast("Please provide at least one identifying detail about the person.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createFoundReport(payload);
      setResult({
        found_id: res.found_id,
        matches: Array.isArray(res.matches) ? res.matches : [],
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.message
          : "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-6">
          <button onClick={() => navigate("dashboard")} className="cursor-pointer text-left">
            <Logo size="sm" />
          </button>
          <Btn variant="light" className="h-9 px-4 text-[12px]" onClick={() => navigate("dashboard")}>
            Save &amp; Exit
          </Btn>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] items-start gap-8 px-6 py-8 lg:grid-cols-[1fr_250px]">
        {/* form / result */}
        <div>
          <h1 className="font-serif text-[25px] font-medium tracking-[-0.01em] text-ink">
            Report a Found Person
          </h1>
          <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-ink2">
            Share what you know about the person you found. We check it against
            missing-person reports and show any potential matches for review.
          </p>

          {result ? (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-[18px] border border-line bg-card p-6"
            >
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-badgeg text-badgegt">
                  <CheckCircle2 size={30} strokeWidth={1.8} />
                </span>
                <h2 className="font-serif text-[20px] font-medium text-ink">
                  Report submitted
                </h2>
                <div className="flex w-full items-center justify-between gap-3 rounded-[12px] border border-line bg-paper2 px-4 py-3">
                  <div className="text-left">
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink3">
                      Report ID
                    </div>
                    <div className="mt-0.5 font-mono text-[14px] font-medium text-ink">
                      {result.found_id}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard
                        .writeText(result.found_id)
                        .then(() => toast("Report ID copied."))
                        .catch(() => toast("Copy failed — please copy manually."));
                    }}
                    className="shrink-0 cursor-pointer rounded-[8px] border border-line bg-card px-3 py-1.5 text-[11px] font-medium text-ink transition-colors hover:border-ink/35"
                  >
                    Copy ID
                  </button>
                </div>
              </div>

              {result.matches.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-[13.5px] font-semibold text-ink">
                    Potential matches for review ({result.matches.length})
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                    These records are algorithmically similar. Scores are
                    similarity rankings, not identity confirmations — human
                    verification is required.
                  </p>
                  <div className="mt-3.5 space-y-3">
                    {result.matches.map((m, i) => (
                      <MatchCard key={`match-${i}`} match={m} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-[12px] border border-line bg-paper2 px-4 py-3 text-center text-[12.5px] leading-relaxed text-ink2">
                  No potential matches were returned yet. Your report is saved
                  and will be included as the database updates.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Btn variant="ghost" onClick={reset} className="gap-1.5">
                  <ArrowLeft size={14} /> Submit another report
                </Btn>
                <Btn onClick={() => navigate("dashboard")}>Back to Dashboard</Btn>
              </div>
            </motion.section>
          ) : (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-[18px] border border-line bg-card p-6"
            >
              <div className="space-y-4">
                <Field label="Describe the person" required>
                  <TextArea
                    placeholder="Appearance, approximate age, condition, where and when you found them…"
                    value={form.description}
                    onChange={set("description")}
                  />
                </Field>
                <Field label="Where you found them">
                  <TextInput
                    placeholder="City, area or landmark"
                    value={form.location}
                    onChange={set("location")}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Approximate age">
                    <TextInput
                      type="number"
                      min={0}
                      max={120}
                      placeholder="e.g. 35"
                      value={form.age}
                      onChange={set("age")}
                    />
                  </Field>
                  <Field label="Gender">
                    <SelectInput value={form.gender} onChange={set("gender")} aria-label="Gender">
                      <option value="">Select</option>
                      {["Male", "Female", "Other"].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <Field label="Name (if known)">
                  <TextInput
                    placeholder="Leave blank if unidentified"
                    value={form.name}
                    onChange={set("name")}
                  />
                </Field>
                <Field label="Clothing worn">
                  <TextInput
                    placeholder="e.g. Blue shirt and dark trousers"
                    value={form.clothing}
                    onChange={set("clothing")}
                  />
                </Field>
                <Field label="Your contact number (optional)">
                  <TextInput
                    type="tel"
                    placeholder="So we can reach you about this report"
                    value={form.contact}
                    onChange={set("contact")}
                  />
                </Field>
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed text-ink3">
                Only one identifying detail is required — fill in what you know.
                Do not share sensitive personal data of the person found.
              </p>
              <div className="mt-5 flex items-center justify-between">
                <Btn variant="ghost" onClick={() => navigate("dashboard")} className="gap-1.5" disabled={submitting}>
                  <ArrowLeft size={14} /> Back
                </Btn>
                <Btn arrow onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Report"}
                </Btn>
              </div>
            </motion.section>
          )}
        </div>

        {/* right rail */}
        <div className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-[18px] bg-peach p-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-rust text-paper2">
              <PhoneCall size={17} strokeWidth={1.9} />
            </div>
            <div className="mt-4 text-[13px] font-semibold text-ink">
              Concerned about safety?
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink2">
              If the person needs medical or police assistance, call 112 first.
            </p>
          </div>
          <div className="rounded-[18px] border border-line bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-greenicon text-paper2">
              <ShieldCheck size={17} strokeWidth={1.9} />
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <MapPin size={13} className="text-ink2" /> Verified sources
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink2">
              Reports are checked against records shared by police and verified
              partners. Matches always require human verification.
            </p>
            <ScriptNote rotate={-4} className="mt-5 text-[19px]">
              &ldquo;Seva hi param dharma hai.&rdquo;
            </ScriptNote>
          </div>
        </div>
      </div>
    </div>
  );
}

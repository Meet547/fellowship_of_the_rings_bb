"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ImageUp,
  PhoneCall,
} from "lucide-react";
import { useRef, useState } from "react";
import { Btn, Field, Logo, ScriptNote, SelectInput, TextArea, TextInput, useToast } from "./ui";
import type { Navigate } from "@/lib/khoj/router";
import { createMissingCase, ApiError } from "@/lib/khoj/api";
import type { FoundReportMatch, Match, MissingCasePayload } from "@/lib/khoj/api-types";

const STEPS = ["Details", "Photos", "Additional Info", "Review"] as const;

type Form = {
  name: string;
  age: string;
  gender: string;
  location: string;
  date: string;
  details: string;
  clothing: string;
  marks: string;
  medical: string;
  contact: string;
};

const EMPTY: Form = {
  name: "",
  age: "",
  gender: "",
  location: "",
  date: "",
  details: "",
  clothing: "",
  marks: "",
  medical: "",
  contact: "",
};

/** sessionStorage key for the in-progress report draft. */
const DRAFT_KEY = "khoj_report_draft";
/** sessionStorage key for the in-progress step number. */
const DRAFT_STEP_KEY = "khoj_report_draft_step";

function loadDraft(): { form: Form; step: number } {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const rawStep = sessionStorage.getItem(DRAFT_STEP_KEY);
    const form: Form = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Form>) } : EMPTY;
    const step = rawStep ? Math.max(1, Math.min(4, Number(rawStep))) : 1;
    return { form, step };
  } catch {
    return { form: EMPTY, step: 1 };
  }
}

function saveDraft(form: Form, step: number) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    sessionStorage.setItem(DRAFT_STEP_KEY, String(step));
  } catch { /* storage unavailable — silent */ }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_STEP_KEY);
  } catch { /* ignore */ }
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="hidden items-center md:flex">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={label} className="flex items-center">
            {i > 0 && <div className="mx-3 h-px w-9 bg-line" />}
            <div className="flex items-center gap-2">
              <span
                className={`flex size-[26px] items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-500 ${
                  active
                    ? "border-ink bg-ink text-paper2"
                    : done
                      ? "border-ink bg-ink text-paper2"
                      : "border-line bg-card text-ink3"
                }`}
              >
                {done ? <CheckCircle2 size={13} /> : idx}
              </span>
              <span
                className={`text-[12.5px] transition-colors duration-300 ${
                  active ? "font-medium text-ink" : "text-ink3"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UrgentHelp() {
  const toast = useToast();
  return (
    <div className="rounded-[18px] bg-peach p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-rust text-paper2">
        <PhoneCall size={17} strokeWidth={1.9} />
      </div>
      <div className="mt-4 text-[13px] font-semibold text-ink">Need urgent help?</div>
      <div className="mt-2 font-serif text-[21px] font-medium leading-tight text-ink">
        Dial 112
        <span className="ml-1.5 font-sans text-[12px] font-normal text-ink2">(Police)</span>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-ink2">
        Or contact a trusted NGO through our network.
      </p>
      <button
        onClick={() => toast("Support resources are not available yet. For urgent help, call 112.")}
        className="group mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink"
      >
        <span className="link-sweep">View Support Resources</span>
        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

const slide = {
  initial: { opacity: 0, x: 26 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -22 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

/* ── match rendering ────────────────────────────────────────────────── */

type MatchOutput = {
  title: string;
  meta: string;
  detail: string;
  score: number | null;
};

function normalizeMatch(m: Match | FoundReportMatch): MatchOutput | null {
  const nested = (m as Partial<Match>)?.candidate ?? null;
  const flat = m as Partial<FoundReportMatch>;

  if (nested) {
    const label =
      nested.name?.trim() ||
      (typeof flat.name === "string" && flat.name.trim() ? flat.name.trim() : "") ||
      "Unidentified person";
    const age = nested.age_range
      ? nested.age_range[0] === nested.age_range[1]
        ? `${nested.age_range[0]} yrs`
        : `~${nested.age_range[0]}-${nested.age_range[1]} yrs`
      : typeof nested.age === "number"
        ? `${nested.age} yrs`
        : typeof nested.age === "string"
          ? nested.age.trim()
          : "";
    const meta: string[] = [];
    if (nested.gender) meta.push(nested.gender);
    if (age) meta.push(age);
    const location = nested.location ?? nested.district ?? nested.state;
    if (location) meta.push(location);
    return {
      title: label,
      meta: meta.join(" · ") || "No details recorded",
      detail: nested.description ?? nested.remarks ?? "",
      score: typeof (m as Match).final_score === "number" ? (m as Match).final_score : null,
    };
  }

  const label =
    (typeof flat.name === "string" && flat.name.trim() ? flat.name.trim() : "") ||
    "Unidentified person";
  const meta: string[] = [];
  if (flat.gender) meta.push(flat.gender);
  if (flat.age) meta.push(String(flat.age));
  if (flat.last_seen_location) meta.push(flat.last_seen_location);
  return {
    title: label,
    meta: meta.join(" · ") || "No details recorded",
    detail: flat.description ?? flat.distinctive_marks ?? "",
    score: typeof flat.final_score === "number" ? flat.final_score : null,
  };
}

function matchTip(searchStatus: string | undefined): string | null {
  if (!searchStatus) return null;
  if (searchStatus === "no_searchable_information") {
    return "We couldn't extract enough identifying details to run a match search on submission. You can still update this case later.";
  }
  if (searchStatus === "awaiting_processing") {
    return "The match search is queued and will run when the platform processes this case.";
  }
  return null;
}

export default function Report({ navigate }: { navigate: Navigate }) {
  const [step, setStep] = useState(() => loadDraft().step);
  const [form, setForm] = useState<Form>(() => loadDraft().form);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    case_id: string;
    search_status?: string;
    matches: MatchOutput[];
  } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  /** Update a single form field, then persist the draft. */
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => {
      const next = { ...f, [k]: e.target.value };
      saveDraft(next, step);
      return next;
    });
  };

  /** Navigate to a step and persist the new step number. */
  const goStep = (n: number) => {
    setStep(n);
    saveDraft(form, n);
  };

  const handleSubmit = async () => {
    if (!form.contact) {
      toast("Add a contact number so responders can reach you.");
      return;
    }
    setSubmitting(true);
    const payload: MissingCasePayload = {
      name: form.name,
      age: form.age,
      gender: form.gender,
      last_seen_location: form.location,
      last_seen_date: form.date,
      description: form.details,
      ...(form.clothing ? { clothing: form.clothing } : {}),
      // Frontend field "marks" maps to backend field "distinctive_marks".
      ...(form.marks ? { distinctive_marks: form.marks } : {}),
      ...(form.medical ? { medical: form.medical } : {}),
      contact: form.contact,
    };
    try {
      const result = await createMissingCase(payload);
      clearDraft();
      const rawMatches = Array.isArray(result.matches) ? result.matches : [];
      setSubmitted({
        case_id: result.case_id,
        search_status: result.search_status,
        matches: rawMatches
          .map(normalizeMatch)
          .filter((m): m is MatchOutput => m !== null),
      });
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

  const reviewRows: [string, string][] = [
    ["Full Name", form.name || "—"],
    ["Age", form.age || "—"],
    ["Gender", form.gender || "—"],
    ["Last Seen Location", form.location || "—"],
    ["Date Last Seen", form.date || "—"],
    ["Clothing Last Worn", form.clothing || "—"],
    ["Identifying Marks", form.marks || "—"],
    ["Contact Number", form.contact || "—"],
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-6">
          <button onClick={() => navigate("landing")} className="cursor-pointer text-left">
            <Logo size="sm" />
          </button>
          <Stepper step={step} />
          <Btn variant="light" className="h-9 px-4 text-[12px]" onClick={() => navigate("landing")}>
            Save &amp; Exit
          </Btn>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] items-start gap-8 px-6 py-8 lg:grid-cols-[190px_1fr_250px]">
        {/* left rail */}
        <div className="hidden lg:sticky lg:top-28 lg:flex lg:flex-col">
          <ScriptNote rotate={-4} className="text-[21px] leading-[1.2]">
            &ldquo;The sooner we search, the sooner we can bring them home.&rdquo;
          </ScriptNote>
          { }
          <img
            src="/images/khoj-heritage.jpg"
            alt="Heritage railway station at dusk"
            loading="lazy"
            className="mt-auto h-[250px] w-full rounded-[16px] object-cover"
          />
        </div>

        {/* center — form */}
        <div>
          <h1 className="font-serif text-[25px] font-medium tracking-[-0.01em] text-ink">
            Report a Missing Person
          </h1>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section key="s1" {...slide} className="mt-4 rounded-[18px] border border-line bg-card p-6">
                <h2 className="font-serif text-[18px] font-medium text-ink">
                  Let&rsquo;s start with the basics
                </h2>
                <div className="mt-5 space-y-4">
                  <Field label="Full Name" required>
                    <TextInput placeholder="Enter full name" value={form.name} onChange={set("name")} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Age" required>
                      <SelectInput value={form.age} onChange={set("age")} aria-label="Age">
                        <option value="">Select age</option>
                        {["Child (0-12)", "13-17", "18-30", "31-50", "51-70", "70+"].map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Field label="Gender" required>
                      <SelectInput value={form.gender} onChange={set("gender")} aria-label="Gender">
                        <option value="">Select</option>
                        {["Male", "Female", "Other"].map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>
                  <Field label="Last Seen Location" required>
                    <TextInput
                      placeholder="Enter city, state or landmark"
                      value={form.location}
                      onChange={set("location")}
                    />
                  </Field>
                  <Field label="Date Last Seen" required htmlFor="report-date">
                    <div className="relative">
                      <TextInput id="report-date" type="date" value={form.date} onChange={set("date")} />
                      <CalendarDays
                        size={15}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3"
                      />
                    </div>
                  </Field>
                  <Field label="Additional Details" required>
                    <TextArea
                      placeholder="Any specific details (clothing, health condition, etc.)"
                      value={form.details}
                      onChange={set("details")}
                    />
                  </Field>
                </div>
                <div className="mt-6 flex justify-end">
                  <Btn arrow onClick={() => {
                    if (!form.name || !form.age || !form.gender || !form.location || !form.date || !form.details) {
                      toast("Complete all required details before continuing.");
                      return;
                    }
                    goStep(2);
                  }}>
                    Next
                  </Btn>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section key="s2" {...slide} className="mt-4 rounded-[18px] border border-line bg-card p-6">
                <h2 className="font-serif text-[18px] font-medium text-ink">Add photographs</h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">
                  Photo upload is not available yet. You can select photos to attach to your report, but they will not be sent or processed at this time.
                </p>
                <button type="button" onClick={() => photoInput.current?.click()} className="mt-5 flex h-[190px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] border border-dashed border-ink/25 bg-paper2 transition-all duration-300 hover:border-rust/45 hover:bg-peach/25">
                  <span className="flex size-12 items-center justify-center rounded-full bg-card text-ink2 shadow-sm">
                    <ImageUp size={20} strokeWidth={1.7} />
                  </span>
                  <span className="text-[13px] font-medium text-ink">Select photos (not uploaded)</span>
                  <span className="text-[11px] text-ink3">JPG or PNG · upload coming soon</span>
                </button>
                <input ref={photoInput} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []).slice(0, 4);
                  setPhotos(selected.map((file) => file.name));
                  if (selected.length) toast(`${selected.length} photo${selected.length === 1 ? "" : "s"} added.`);
                }} />
                {photos.length > 0 && <p className="mt-2 text-[11px] text-badgegt">{photos.length} photo(s) noted · not sent to server</p>}
                <div className="mt-6 flex items-center justify-between">
                  <Btn variant="ghost" onClick={() => goStep(1)} className="gap-1.5">
                    <ArrowLeft size={14} /> Back
                  </Btn>
                  <Btn arrow onClick={() => goStep(3)}>
                    Next
                  </Btn>
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section key="s3" {...slide} className="mt-4 rounded-[18px] border border-line bg-card p-6">
                <h2 className="font-serif text-[18px] font-medium text-ink">
                  Anything else that could help
                </h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">
                  Small details often make the biggest difference in finding someone.
                </p>
                <div className="mt-5 space-y-4">
                  <Field label="Clothing Last Worn">
                    <TextInput
                      placeholder="e.g. White kurta, blue slippers"
                      value={form.clothing}
                      onChange={set("clothing")}
                    />
                  </Field>
                  <Field label="Identifying Marks">
                    <TextInput
                      placeholder="e.g. Scar on left eyebrow, birthmark"
                      value={form.marks}
                      onChange={set("marks")}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Medical Conditions">
                      <SelectInput value={form.medical} onChange={set("medical")} aria-label="Medical conditions">
                        <option value="">Select</option>
                        {["Memory loss", "Mental health", "Physical disability", "None known"].map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Field label="Contact Number" required>
                      <TextInput
                        placeholder="Your phone number"
                        value={form.contact}
                        onChange={set("contact")}
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Btn variant="ghost" onClick={() => goStep(2)} className="gap-1.5">
                    <ArrowLeft size={14} /> Back
                  </Btn>
                  <Btn arrow onClick={() => {
                    if (!form.contact.trim()) {
                      toast("Contact number is required.");
                      return;
                    }
                    goStep(4);
                  }}>
                    Next
                  </Btn>
                </div>
              </motion.section>
            )}

            {step === 4 && !submitted && (
              <motion.section key="s4" {...slide} className="mt-4 rounded-[18px] border border-line bg-card p-6">
                <h2 className="font-serif text-[18px] font-medium text-ink">
                  Review before submitting
                </h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">
                  Please check the details carefully. Our teams across India will use this
                  information to search.
                </p>
                <div className="mt-5 divide-y divide-line2 rounded-[14px] border border-line2 bg-paper2 px-5">
                  {reviewRows.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-6 py-3">
                      <span className="text-[12px] text-ink3">{k}</span>
                      <span className="max-w-[60%] text-right text-[13px] font-medium text-ink">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Btn variant="ghost" onClick={() => goStep(3)} className="gap-1.5" disabled={submitting}>
                    <ArrowLeft size={14} /> Back
                  </Btn>
                  <Btn arrow onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting\u2026" : "Submit Report"}
                  </Btn>
                </div>
              </motion.section>
            )}

            {submitted && (
              <motion.section key="success" {...slide} className="mt-4 rounded-[18px] border border-line bg-card p-6">
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-badgeg text-badgegt">
                    <CheckCircle2 size={30} strokeWidth={1.8} />
                  </span>
                  <h2 className="font-serif text-[20px] font-medium text-ink">Report submitted</h2>
                  <p className="max-w-[340px] text-[13px] leading-relaxed text-ink2">
                    Your report has been received and checked against found-person records.
                  </p>
                  <div className="mt-1 flex w-full items-center justify-between gap-3 rounded-[12px] border border-line bg-paper2 px-4 py-3">
                    <div className="text-left">
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink3">Case ID</div>
                      <div className="mt-0.5 font-mono text-[14px] font-medium text-ink">{submitted.case_id}</div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(submitted.case_id)
                          .then(() => toast("Case ID copied."))
                          .catch(() => toast("Copy failed \u2014 please copy manually."));
                      }}
                      className="shrink-0 rounded-[8px] border border-line bg-card px-3 py-1.5 text-[11px] font-medium text-ink transition-colors hover:border-ink/35 cursor-pointer"
                    >
                      Copy ID
                    </button>
                  </div>
                  <p className="text-[11.5px] text-ink3">Save your Case ID to track this report.</p>

                  {matchTip(submitted.search_status) && (
                    <p className="w-full rounded-[12px] border border-line bg-paper2 px-4 py-3 text-left text-[12.5px] leading-relaxed text-ink2">
                      {matchTip(submitted.search_status)}
                    </p>
                  )}

                  {submitted.matches.length > 0 && (
                    <div className="w-full text-left">
                      <h3 className="text-[13.5px] font-semibold text-ink">
                        Potential matches for review ({submitted.matches.length})
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                        These records are algorithmically similar. Scores are similarity
                        rankings, not identity confirmations — human verification is required.
                      </p>
                      <div className="mt-3.5 space-y-3">
                        {submitted.matches.map((m, i) => (
                          <div key={i} className="rounded-[14px] border border-line bg-paper2 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-[13.5px] font-semibold text-ink">{m.title}</div>
                                <div className="mt-0.5 text-[12px] text-ink2">{m.meta}</div>
                              </div>
                              <span className="shrink-0 rounded-full bg-badgeg px-2.5 py-1 text-[11px] font-semibold text-badgegt">
                                Potential Match
                              </span>
                            </div>
                            {m.detail && (
                              <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink2">
                                {m.detail}
                              </p>
                            )}
                            {m.score !== null && (
                              <div className="mt-3 text-[11px] text-ink3">
                                Match Score {Math.round(m.score)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Btn className="mt-2" onClick={() => navigate("dashboard")}>
                    Back to Dashboard
                  </Btn>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* mobile progress */}
          <div className="mt-5 flex items-center gap-2 md:hidden">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < step ? "bg-ink" : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        {/* right rail */}
        <div className="lg:sticky lg:top-28">
          <UrgentHelp />
        </div>
      </div>
    </div>
  );
}

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
import { useState } from "react";
import { Btn, Field, Logo, ScriptNote, SelectInput, TextArea, TextInput } from "./ui";
import type { Navigate } from "@/lib/khoj/router";

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
      <button className="group mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-ink">
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

export default function Report({ navigate }: { navigate: Navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
                  <Field label="Date Last Seen" required>
                    <div className="relative">
                      <TextInput type="date" value={form.date} onChange={set("date")} />
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
                  <Btn arrow onClick={() => setStep(2)}>
                    Next
                  </Btn>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section key="s2" {...slide} className="mt-4 rounded-[18px] border border-line bg-card p-6">
                <h2 className="font-serif text-[18px] font-medium text-ink">Add photographs</h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink2">
                  Clear photos help our AI find matches faster. You can add up to 4 photos.
                </p>
                <button className="mt-5 flex h-[190px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] border border-dashed border-ink/25 bg-paper2 transition-all duration-300 hover:border-rust/45 hover:bg-peach/25">
                  <span className="flex size-12 items-center justify-center rounded-full bg-card text-ink2 shadow-sm">
                    <ImageUp size={20} strokeWidth={1.7} />
                  </span>
                  <span className="text-[13px] font-medium text-ink">Click to upload photos</span>
                  <span className="text-[11px] text-ink3">JPG or PNG, up to 10MB each</span>
                </button>
                <div className="mt-6 flex items-center justify-between">
                  <Btn variant="ghost" onClick={() => setStep(1)} className="gap-1.5">
                    <ArrowLeft size={14} /> Back
                  </Btn>
                  <Btn arrow onClick={() => setStep(3)}>
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
                    <Field label="Contact Number">
                      <TextInput
                        placeholder="Your phone number"
                        value={form.contact}
                        onChange={set("contact")}
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Btn variant="ghost" onClick={() => setStep(2)} className="gap-1.5">
                    <ArrowLeft size={14} /> Back
                  </Btn>
                  <Btn arrow onClick={() => setStep(4)}>
                    Next
                  </Btn>
                </div>
              </motion.section>
            )}

            {step === 4 && (
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
                  <Btn variant="ghost" onClick={() => setStep(3)} className="gap-1.5">
                    <ArrowLeft size={14} /> Back
                  </Btn>
                  <Btn arrow onClick={() => navigate("searching")}>
                    Submit Report
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

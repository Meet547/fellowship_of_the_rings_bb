"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImageIcon,
  Mic,
  PartyPopper,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "./app-shell";
import { Stepper } from "./shared";
import { GENDERS, REPORT_CHIPS, REPORT_STEPS } from "@/lib/khoj/data";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

const AGE_RANGES = [
  "Select age range",
  "Under 18",
  "18 - 30 years",
  "30 - 45 years",
  "45 - 60 years",
  "60 - 75 years",
  "Over 75 years",
];

function Step1Share() {
  const { foundReport, setFoundReport, setFoundStep } = useKhoj();
  const [preview, setPreview] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (f?: File | null) => {
    if (!f) return;
    setFoundReport({ photoName: f.name });
    setPreview(URL.createObjectURL(f));
  };

  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => {
      setListening(false);
      setFoundReport({
        description:
          (foundReport.description ? foundReport.description + " " : "") +
          "Elderly man found near Dadar station. Seems confused, wearing a blue shirt.",
      });
    }, 2600);
    return () => clearTimeout(t);
     
  }, [listening]);

  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
        Help us identify and reunite this person.
      </h1>
      <p className="mt-2.5 max-w-[540px] text-[13.5px] text-ink-soft">
        Upload a photo and share any details you know. Even small information can help.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "upload-dash grid aspect-[4/3] w-full place-items-center rounded-[22px] border-2 border-dashed border-line-2 bg-white/60 transition-colors hover:border-ink/40",
              preview && "border-solid border-line"
            )}
          >
            {preview ? (
              <span className="relative block h-full w-full p-3">
                { }
                <img
                  src={preview}
                  alt="Uploaded person"
                  className="h-full w-full rounded-2xl object-cover"
                />
                <span className="absolute bottom-5 right-5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium shadow">
                  {foundReport.photoName}
                </span>
              </span>
            ) : (
              <span className="px-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink/[0.05]">
                  <ImageIcon className="h-6 w-6 text-ink-2" strokeWidth={1.5} />
                </span>
                <span className="mt-4 block text-[14px] font-semibold">Upload a photo</span>
                <span className="mt-1 block text-[12px] leading-relaxed text-ink-faint">
                  Click to upload or drag and drop
                  <br />
                  JPG, PNG, WebP (max 10MB)
                </span>
              </span>
            )}
          </motion.button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-full border border-line-2 bg-white py-2.5 text-[12.5px] font-medium transition-all hover:border-ink/40"
            >
              <Camera className="h-4 w-4 text-ink-2" /> Take photo
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-full border border-line-2 bg-white py-2.5 text-[12.5px] font-medium transition-all hover:border-ink/40"
            >
              <Upload className="h-4 w-4 text-ink-2" /> Upload from device
            </button>
          </div>
        </div>

        {/* Describe */}
        <div className="flex flex-col">
          <label className="text-[13px] font-semibold">Or describe the person</label>
          <div className="mt-3 flex-1 rounded-[22px] border border-line-2 bg-white transition-colors focus-within:border-ink/40">
            <textarea
              ref={taRef}
              value={foundReport.description}
              onChange={(e) => setFoundReport({ description: e.target.value })}
              placeholder="You can also describe them here (voice or text)..."
              rows={7}
              className="w-full resize-none rounded-t-[22px] bg-transparent px-5 pt-5 text-[13.5px] leading-relaxed outline-none placeholder:text-ink-faint"
            />
            <div className="flex justify-end gap-2 px-4 pb-4">
              <button
                onClick={() => setListening(!listening)}
                aria-label="Voice input"
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border transition-all",
                  listening ? "border-ink bg-ink text-[#f4f2ee]" : "border-line-2 text-ink-2 hover:border-ink/40"
                )}
              >
                <Mic className="h-4 w-4" strokeWidth={1.7} />
              </button>
              <button
                onClick={() => taRef.current?.focus()}
                aria-label="Confirm text"
                className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[#f4f2ee]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {REPORT_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setFoundReport({ description: c });
                  taRef.current?.focus();
                }}
                className="rounded-full border border-line-2 bg-white px-3.5 py-2 text-[11.5px] text-ink-soft transition-all hover:border-ink/40 hover:text-ink"
              >
                {c}
              </button>
            ))}
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

      <div className="mt-8 flex items-center justify-end">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFoundStep(1)}
          disabled={!foundReport.photoName && !foundReport.description.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-opacity hover:bg-black disabled:opacity-30"
        >
          Next <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

function Step2Details() {
  const { foundReport, setFoundReport, setFoundStep } = useKhoj();
  const field =
    "mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5";

  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
        A few more details
      </h1>
      <p className="mt-2.5 text-[13.5px] text-ink-soft">
        These help NGOs and authorities match faster. Fill what you can.
      </p>

      <div className="mt-8 max-w-[640px] space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label htmlFor="f-age" className="text-[12px] font-medium text-ink-2">
              Approximate age
            </label>
            <select
              id="f-age"
              value={foundReport.ageRange}
              onChange={(e) => setFoundReport({ ageRange: e.target.value })}
              className={field + " appearance-none pr-9"}
            >
              {AGE_RANGES.map((a) => (
                <option key={a} disabled={a === AGE_RANGES[0]}>
                  {a}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute bottom-3.5 right-3.5 text-ink-faint">▾</span>
          </div>
          <div className="relative">
            <label htmlFor="f-gender" className="text-[12px] font-medium text-ink-2">
              Gender
            </label>
            <select
              id="f-gender"
              value={foundReport.gender}
              onChange={(e) => setFoundReport({ gender: e.target.value })}
              className={field + " appearance-none pr-9"}
            >
              <option disabled>Select</option>
              {GENDERS.filter((g) => g !== "Any").map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute bottom-3.5 right-3.5 text-ink-faint">▾</span>
          </div>
        </div>

        <div>
          <label htmlFor="f-loc" className="text-[12px] font-medium text-ink-2">
            Where did you find them?
          </label>
          <input
            id="f-loc"
            value={foundReport.foundLocation}
            onChange={(e) => setFoundReport({ foundLocation: e.target.value })}
            placeholder="Enter location"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="f-say" className="text-[12px] font-medium text-ink-2">
            What can they tell you?
          </label>
          <textarea
            id="f-say"
            rows={3}
            value={foundReport.theySay}
            onChange={(e) => setFoundReport({ theySay: e.target.value })}
            placeholder="E.g. name, language, hometown, place, any details"
            className={field + " resize-none"}
          />
        </div>

        <div>
          <label htmlFor="f-other" className="text-[12px] font-medium text-ink-2">
            Any other details?
          </label>
          <textarea
            id="f-other"
            rows={2}
            value={foundReport.otherDetails}
            onChange={(e) => setFoundReport({ otherDetails: e.target.value })}
            placeholder="Clothing, condition, objects, etc."
            className={field + " resize-none"}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setFoundStep(0)}
          className="text-[13px] text-ink-soft transition-colors hover:text-ink"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => useKhoj.getState().navigate("dashboard")}
            className="rounded-full border border-line-2 bg-white px-5 py-3 text-[13px] font-medium transition-all hover:border-ink/40"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFoundStep(2)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-colors hover:bg-black"
          >
            Next <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Step3Review() {
  const { foundReport, setFoundStep } = useKhoj();
  const rows: [string, string][] = [
    ["Photo", foundReport.photoName ?? "—"],
    ["Description", foundReport.description || "—"],
    ["Approximate age", foundReport.ageRange || "—"],
    ["Gender", foundReport.gender || "—"],
    ["Found at", foundReport.foundLocation || "—"],
    ["They mentioned", foundReport.theySay || "—"],
    ["Other details", foundReport.otherDetails || "—"],
  ];

  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
        Review before submitting
      </h1>
      <p className="mt-2.5 text-[13.5px] text-ink-soft">
        Please confirm the information below. You can go back and edit anything.
      </p>

      <div className="mt-8 max-w-[640px] rounded-[22px] border border-line bg-white/80 p-6">
        <div className="divide-y divide-line/80">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-6 py-3 first:pt-0 last:pb-0">
              <span className="shrink-0 text-[12px] text-ink-faint">{k}</span>
              <span className="max-w-[380px] text-right text-[13px] font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setFoundStep(1)}
          className="text-[13px] text-ink-soft transition-colors hover:text-ink"
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFoundStep(3)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-colors hover:bg-black"
        >
          Submit report <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

function Step4Submit() {
  const { navigate, resetFound } = useKhoj();
  const caseId = "#KHUJ-2026-0" + (Math.floor(Math.random() * 7) + 3);

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-match-green"
      >
        <CheckCircle2 className="h-8 w-8 text-match-green-text" strokeWidth={1.6} />
      </motion.span>

      <h1 className="mt-6 text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">
        Thank you. This matters.
      </h1>
      <p className="mx-auto mt-2.5 max-w-[440px] text-[13.5px] leading-relaxed text-ink-soft">
        Your report is now with our network of NGOs and authorities. Khoj will try to
        identify this person and reach out to their family.
      </p>

      <div className="mt-7 flex items-center gap-3 rounded-full border border-line bg-white px-5 py-3">
        <PartyPopper className="h-4 w-4 text-ink-2" />
        <span className="text-[13px] font-semibold">Case {caseId} created</span>
        <span className="rounded-full bg-match-amber px-2.5 py-1 text-[11px] font-semibold text-match-amber-text">
          In Review
        </span>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            resetFound();
            navigate("dashboard");
          }}
          className="rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-[#f4f2ee] transition-colors hover:bg-black"
        >
          Back to dashboard
        </button>
        <button
          onClick={() => {
            resetFound();
            navigate("cases");
          }}
          className="rounded-full border border-line-2 bg-white px-6 py-3 text-[13px] font-medium transition-all hover:border-ink/40"
        >
          View my cases
        </button>
      </div>
    </div>
  );
}

export default function FoundSomeone() {
  const { foundStep, setFoundStep } = useKhoj();

  return (
    <AppShell active="found">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-8">
          <Stepper
            steps={REPORT_STEPS}
            current={foundStep}
            onStepClick={(i) => i <= foundStep && setFoundStep(i)}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={foundStep}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.21, 0.65, 0.35, 1] }}
          >
            {foundStep === 0 && <Step1Share />}
            {foundStep === 1 && <Step2Details />}
            {foundStep === 2 && <Step3Review />}
            {foundStep === 3 && <Step4Submit />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

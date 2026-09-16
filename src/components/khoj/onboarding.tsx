"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  FlaskConical,
  Heart,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "./shared";
import { ONBOARDING_ROLES } from "@/lib/khoj/data";
import type { Role } from "@/lib/khoj/data";
import { useKhoj } from "@/lib/khoj/store";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<string, React.ElementType> = {
  heart: Heart,
  user: User,
  building: Building2,
  shield: ShieldCheck,
  flask: FlaskConical,
  sparkle: Sparkles,
};

function StepHeader({ step }: { step: number }) {
  return (
    <div className="w-full max-w-[280px]">
      <div className="flex items-center justify-between text-[11px] font-medium text-ink-faint">
        <span>Step {step + 1} of 3</span>
        <span>{Math.round(((step + 1) / 3) * 100)}%</span>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-ink"
          initial={false}
          animate={{ width: `${((step + 1) / 3) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.21, 0.65, 0.35, 1] }}
        />
      </div>
    </div>
  );
}

export default function Onboarding() {
  const {
    onboardingStep,
    setOnboardingStep,
    role,
    setRole,
    user,
    phone,
    city,
    prefsEmail,
    prefsSms,
    prefsWhatsapp,
    setOnboardingDetail,
    finishOnboarding,
  } = useKhoj();
  const [name, setName] = useState(user?.fullName ?? "");
  const [error, setError] = useState("");

  const steps = [
    {
      title: "How would you like to use Khoj?",
      sub: "Select the option that best describes you.",
    },
    {
      title: "Tell us a bit about yourself.",
      sub: "This helps authorities and NGOs reach you faster.",
    },
    {
      title: "Choose how we keep you posted.",
      sub: "Alerts about possible matches and case updates. You can change these anytime.",
    },
  ];

  const next = () => {
    setError("");
    if (onboardingStep === 0 && !role) {
      setError("Please select an option to continue.");
      return;
    }
    if (onboardingStep === 1 && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (onboardingStep < 2) setOnboardingStep(onboardingStep + 1);
    else finishOnboarding();
  };

  const togglePref = (key: "prefsEmail" | "prefsSms" | "prefsWhatsapp") =>
    setOnboardingDetail({
      [key]: !useKhoj.getState()[key],
    } as never);

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-7 sm:px-12">
      <div className="flex items-center justify-between">
        <Logo tagline={false} onClick={() => useKhoj.getState().navigate("landing")} />
        <StepHeader step={onboardingStep} />
      </div>

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45, ease: [0.21, 0.65, 0.35, 1] }}
          >
            <h1 className="text-[30px] font-semibold tracking-[-0.02em] sm:text-[34px]">
              {steps[onboardingStep].title}
            </h1>
            <p className="mt-2.5 text-[14px] text-ink-soft">{steps[onboardingStep].sub}</p>

            {/* -------- Step 1: role cards -------- */}
            {onboardingStep === 0 && (
              <div className="mt-10 grid gap-3.5 sm:grid-cols-3">
                {ONBOARDING_ROLES.map((r, i) => {
                  const Icon = ROLE_ICONS[r.icon];
                  const active = role === r.role;
                  return (
                    <motion.button
                      key={r.role}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.45 }}
                      whileHover={{ y: -3 }}
                      onClick={() => setRole(r.role as Role)}
                      className={cn(
                        "relative rounded-2xl border p-4.5 p-5 text-left transition-all duration-300",
                        active
                          ? "border-ink bg-white shadow-[0_18px_36px_-18px_rgba(20,19,17,0.35)]"
                          : "border-line-2 bg-white/60 hover:border-ink/40 hover:bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <Icon
                          className={cn(
                            "h-[19px] w-[19px] transition-colors",
                            active ? "text-ink" : "text-ink-soft"
                          )}
                          strokeWidth={1.6}
                        />
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[#f4f2ee]"
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="mt-7 text-[14px] font-semibold tracking-tight">
                        {r.role}
                      </div>
                      <div className="mt-1 text-[12px] text-ink-soft">{r.desc}</div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* -------- Step 2: personal details -------- */}
            {onboardingStep === 1 && (
              <div className="mt-10 max-w-[520px] space-y-4">
                <div>
                  <label htmlFor="ob-name" className="text-[12px] font-medium text-ink-2">
                    Full name
                  </label>
                  <input
                    id="ob-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
                  />
                </div>
                <div>
                  <label htmlFor="ob-phone" className="text-[12px] font-medium text-ink-2">
                    Phone <span className="text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="ob-phone"
                    value={phone}
                    onChange={(e) => setOnboardingDetail({ phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
                  />
                </div>
                <div>
                  <label htmlFor="ob-city" className="text-[12px] font-medium text-ink-2">
                    City <span className="text-ink-faint">(for nearby support)</span>
                  </label>
                  <input
                    id="ob-city"
                    value={city}
                    onChange={(e) => setOnboardingDetail({ city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
                  />
                </div>
              </div>
            )}

            {/* -------- Step 3: preferences -------- */}
            {onboardingStep === 2 && (
              <div className="mt-10 max-w-[560px] space-y-3">
                {[
                  {
                    key: "prefsEmail" as const,
                    title: "Email alerts",
                    desc: "Possible matches and weekly case summaries.",
                  },
                  {
                    key: "prefsSms" as const,
                    title: "SMS alerts",
                    desc: "Only urgent, high-confidence matches.",
                  },
                  {
                    key: "prefsWhatsapp" as const,
                    title: "WhatsApp updates",
                    desc: "Progress nudges and nearby sightings.",
                  },
                ].map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between rounded-2xl border border-line-2 bg-white/70 px-5 py-4"
                  >
                    <div>
                      <div className="text-[14px] font-medium">{p.title}</div>
                      <div className="mt-0.5 text-[12px] text-ink-soft">{p.desc}</div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={useKhoj.getState()[p.key]}
                      aria-label={p.title}
                      onClick={() => togglePref(p.key)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors duration-300",
                        useKhoj.getState()[p.key] ? "bg-ink" : "bg-line-2"
                      )}
                    >
                      <motion.span
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow",
                          useKhoj.getState()[p.key] ? "right-0.5" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-line-2 bg-white/40 px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">You&apos;re set, {name.split(" ")[0] || "friend"}.</span>{" "}
                  {role ?? "Family Member"} · {name || user?.email || "you@example.com"} — Khoj
                  will guide you through your first search next.
                </div>
              </div>
            )}

            {error && <p className="mt-5 text-[12px] text-red-600">{error}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto flex w-full max-w-[760px] items-center justify-between">
        <button
          onClick={() => (onboardingStep > 0 ? setOnboardingStep(onboardingStep - 1) : useKhoj.getState().navigate("landing"))}
          className="text-[13px] text-ink-soft transition-colors hover:text-ink"
        >
          {onboardingStep > 0 ? "← Back" : ""}
        </button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={next}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13.5px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-all hover:bg-black"
        >
          {onboardingStep === 2 ? "Enter Khoj" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </div>
  );
}

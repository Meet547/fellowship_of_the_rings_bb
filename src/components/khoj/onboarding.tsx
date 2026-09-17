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
import { Button, EASE, EASE_INOUT, Logo, fieldCls, labelCls } from "./shared";
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

/* Viewport-edge progress hairline — full width, top of screen */
function ProgressRail({ step }: { step: number }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-ink/8">
      <motion.div
        className="h-full bg-ink"
        initial={false}
        animate={{ width: `${((step + 1) / 3) * 100}%` }}
        transition={{ duration: 0.7, ease: EASE }}
      />
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

  const back = () =>
    onboardingStep > 0
      ? setOnboardingStep(onboardingStep - 1)
      : useKhoj.getState().navigate("landing");

  const togglePref = (key: "prefsEmail" | "prefsSms" | "prefsWhatsapp") =>
    setOnboardingDetail({
      [key]: !useKhoj.getState()[key],
    } as never);

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-6 sm:px-12">
      <ProgressRail step={onboardingStep} />

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Logo tagline={false} onClick={() => useKhoj.getState().navigate("landing")} />
        <div className="micro tabular text-ink-faint">
          Step 0{onboardingStep + 1} <span className="mx-1 text-ink/25">/</span> 03
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-[780px] flex-1 flex-col justify-center py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -26, transition: { duration: 0.25, ease: EASE_INOUT } }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <h1 className="display-xl max-w-[560px] text-[clamp(32px,4vw,44px)]">
              {steps[onboardingStep].title}
            </h1>
            <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-ink-soft">
              {steps[onboardingStep].sub}
            </p>

            {/* -------- Step 1: role cards -------- */}
            {onboardingStep === 0 && (
              <div className="mt-12 grid gap-3 sm:grid-cols-3">
                {ONBOARDING_ROLES.map((r, i) => {
                  const Icon = ROLE_ICONS[r.icon];
                  const active = role === r.role;
                  return (
                    <motion.button
                      key={r.role}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 * i, duration: 0.55, ease: EASE }}
                      onClick={() => setRole(r.role as Role)}
                      className={cn(
                        "group relative rounded-2xl border p-5 text-left transition-all duration-300",
                        active
                          ? "border-ink bg-paper-2"
                          : "border-line-2 bg-transparent hover:border-ink/50 hover:bg-paper-2"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] transition-colors",
                            active ? "text-ink" : "text-ink-soft"
                          )}
                          strokeWidth={1.5}
                        />
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className="grid h-5 w-5 place-items-center rounded-full bg-ink text-paper"
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="mt-9 text-[14px] font-medium tracking-[-0.01em] text-ink">
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
              <div className="mt-12 max-w-[480px] space-y-5">
                <div>
                  <label htmlFor="ob-name" className={labelCls}>
                    Full name
                  </label>
                  <input
                    id="ob-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={fieldCls + " mt-2"}
                  />
                </div>
                <div>
                  <label htmlFor="ob-phone" className={labelCls}>
                    Phone <span className="normal-case tracking-normal text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="ob-phone"
                    value={phone}
                    onChange={(e) => setOnboardingDetail({ phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={fieldCls + " mt-2 tabular"}
                  />
                </div>
                <div>
                  <label htmlFor="ob-city" className={labelCls}>
                    City <span className="normal-case tracking-normal text-ink-faint">(for nearby support)</span>
                  </label>
                  <input
                    id="ob-city"
                    value={city}
                    onChange={(e) => setOnboardingDetail({ city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className={fieldCls + " mt-2"}
                  />
                </div>
              </div>
            )}

            {/* -------- Step 3: preferences -------- */}
            {onboardingStep === 2 && (
              <div className="mt-12 max-w-[540px] space-y-2.5">
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
                ].map((p) => {
                  const on = useKhoj.getState()[p.key];
                  return (
                    <div
                      key={p.key}
                      className="flex items-center justify-between rounded-2xl border border-line-2 px-5 py-4 transition-colors hover:border-ink/30"
                    >
                      <div>
                        <div className="text-[14px] font-medium text-ink">{p.title}</div>
                        <div className="mt-0.5 text-[12px] text-ink-soft">{p.desc}</div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={on}
                        aria-label={p.title}
                        onClick={() => togglePref(p.key)}
                        className={cn(
                          "relative h-[22px] w-[40px] rounded-full transition-colors duration-300",
                          on ? "bg-ink" : "bg-line-2"
                        )}
                      >
                        <motion.span
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 32 }}
                          className={cn(
                            "absolute top-[2px] h-[18px] w-[18px] rounded-full bg-paper-2",
                            on ? "right-[2px]" : "left-[2px]"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
                <div className="mt-6 border-t border-ink/15 pt-5 text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-medium text-ink">
                    You&apos;re set, {name.split(" ")[0] || "friend"}.
                  </span>{" "}
                  {role ?? "Family Member"} · {name || user?.email || "you@example.com"} —
                  Khoj will guide you through your first search next.
                </div>
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border-l-2 border-[#b3402f] pl-3 text-[12px] text-[#b3402f]"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="mx-auto flex w-full max-w-[780px] items-center justify-between">
        <button
          onClick={back}
          className="micro flex items-center gap-2 !text-[9.5px] text-ink-soft transition-colors hover:text-ink"
        >
          {onboardingStep > 0 ? "← Back" : ""}
        </button>
        <Button onClick={next} magnetic icon={onboardingStep === 2 ? undefined : <ArrowRight className="h-3.5 w-3.5" />}>
          {onboardingStep === 2 ? "Enter Khoj" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

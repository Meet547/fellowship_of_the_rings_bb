"use client";

import { cn } from "@/lib/utils";
import { isAmplifyConfigured } from "@/lib/amplify";
import { KhojMark } from "@/components/khoj/primitives";
import {
  getSession,
  isValidEmail,
  nameFromEmail,
  setSession,
} from "@/lib/session";
import { AnimatePresence, motion } from "framer-motion";
import { confirmSignUp, signIn, signUp } from "aws-amplify/auth";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

type Mode = "signin" | "signup" | "verify";
type Status = "idle" | "loading" | "success";

/* -------------------------------------------------------------------------- */
/*  Field primitives                                                          */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="block overflow-hidden text-[12.5px] text-[#b3261e]"
          >
            <span className="block pt-1">{error}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-linec bg-white px-3.5 text-[15px] text-ink placeholder:text-faint/80 transition-shadow focus:border-accent/50 focus:outline-none focus:ring-[3px] focus:ring-accent/15";

/* -------------------------------------------------------------------------- */
/*  Submit button with idle → loading → success states                        */
/* -------------------------------------------------------------------------- */

function SubmitButton({
  status,
  idle,
  loading,
  success,
}: {
  status: Status;
  idle: string;
  loading: string;
  success: string;
}) {
  return (
    <button
      type="submit"
      disabled={status !== "idle"}
      className={cn(
        "group flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        status === "idle"
          ? "bg-accent shadow-[0_1px_2px_rgba(24,22,35,0.18)] hover:bg-accent-deep active:scale-[0.99]"
          : "bg-accent-deep"
      )}
    >
      {status === "idle" && (
        <>
          {idle}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
        </>
      )}
      {status === "loading" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
          {loading}
        </>
      )}
      {status === "success" && (
        <>
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="h-4 w-4" strokeWidth={2.6} />
          </motion.span>
          {success}
        </>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Six-digit verification (demo — any code works)                            */
/* -------------------------------------------------------------------------- */

function OtpInput({
  disabled,
  onComplete,
}: {
  disabled: boolean;
  onComplete: (code: string) => void;
}) {
  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""));
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    setDigits(next);
    if (next.every((d) => d !== "")) {
      setTimeout(() => onComplete(next.join("")), 350);
    }
  };

  const handleChange = (i: number, raw: string) => {
    const val = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    if (val && i < 5) refs.current[i + 1]?.focus();
    commit(next);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6)
      .fill("")
      .map((_, i) => pasted[i] ?? "");
    refs.current[Math.min(pasted.length, 5)]?.focus();
    commit(next);
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          disabled={disabled}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "h-13 w-full max-w-[56px] rounded-xl border bg-white py-3 text-center text-[20px] font-medium text-ink transition-all focus:border-accent/50 focus:outline-none focus:ring-[3px] focus:ring-accent/15",
            d ? "border-accent/45" : "border-linec",
            disabled && "opacity-60"
          )}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function SignInPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SignInInner />
    </React.Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/pipeline";

  const [mode, setMode] = React.useState<Mode>("signin");
  const [status, setStatus] = React.useState<Status>("idle");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [verifying, setVerifying] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");

  React.useEffect(() => {
    getSession().then((session) => {
      if (session) router.replace(next);
    });
  }, [router, next]);

  const finish = (who: { name: string; email: string }) => {
    setSession({ name: who.name, email: who.email, since: new Date().toISOString() });
    setTimeout(() => router.replace(next), 750);
  };

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!isValidEmail(email)) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    if (isAmplifyConfigured) {
      try {
        const result = await signIn({ username: email.trim(), password });
        if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
          setMode("verify");
          setStatus("idle");
          return;
        }
        setStatus("success");
        finish({ name: nameFromEmail(email), email: email.trim() });
      } catch (error) {
        setStatus("idle");
        setErrors({ password: error instanceof Error ? error.message : "Unable to sign in." });
      }
      return;
    }
    setTimeout(() => {
      setStatus("success");
      finish({ name: nameFromEmail(email), email: email.trim() });
    }, 950);
  };

  const submitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Tell us your name.";
    if (!isValidEmail(email)) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    if (isAmplifyConfigured) {
      try {
        const result = await signUp({
          username: email.trim(),
          password,
          options: { userAttributes: { email: email.trim(), name: name.trim() } },
        });
        setStatus("idle");
        if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") setMode("verify");
        else finish({ name: name.trim(), email: email.trim() });
      } catch (error) {
        setStatus("idle");
        setErrors({ email: error instanceof Error ? error.message : "Unable to create account." });
      }
      return;
    }
    setTimeout(() => {
      setStatus("idle");
      setMode("verify");
    }, 950);
  };

  const verifyCode = async (code?: string) => {
    if (verifying) return;
    const value = code ?? "";
    if (value.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }
    setOtpError("");
    setVerifying(true);
    if (isAmplifyConfigured) {
      try {
        await confirmSignUp({ username: email.trim(), confirmationCode: value });
        await signIn({ username: email.trim(), password });
        finish({ name: name.trim() || nameFromEmail(email), email: email.trim() });
      } catch (error) {
        setVerifying(false);
        setOtpError(error instanceof Error ? error.message : "That code could not be verified.");
      }
      return;
    }
    setTimeout(() => {
      finish({ name: name.trim() || nameFromEmail(email), email: email.trim() });
    }, 1050);
  };

  const switchMode = (m: Mode) => {
    if (status !== "idle" || verifying) return;
    setErrors({});
    setMode(m);
  };

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_1fr]">
      {/* ------------------------------------------------ brand panel */}
      <aside className="relative hidden overflow-hidden bg-lav-deep lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="panel-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 40%, transparent 20%, #ecebf8 100%)",
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2.5">
          <KhojMark className="h-7 w-7 text-ink" />
          <span className="text-[13px] font-semibold tracking-[0.26em] text-ink">KHOJ</span>
        </div>

        <div className="relative max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              Khoj / Investigation
            </p>
            <h1 className="mt-3 text-[42px] font-medium leading-[1.08] tracking-[-0.03em] text-ink">
              Find someone.
              <br />
              Follow the evidence.
            </h1>
            <p className="mt-4 text-[16px] leading-[1.6] text-body">
              Sign in to run investigations, review potential leads, and talk
              through the evidence — every result shows where it came from.
            </p>
          </motion.div>

          <ul className="mt-9 space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: "Traceable sources",
                body: "Every lead cites the records, reports and articles behind it.",
              },
              {
                icon: FileSearch,
                title: "Evidence-first matching",
                body: "Matches are compared on age, date, place and description.",
              },
              {
                icon: Lock,
                title: "Private case records",
                body: "Your case is visible only to you, until you choose to share it.",
              },
            ].map((item, i) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.5, ease: EASE }}
                className="flex items-start gap-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-linline bg-white">
                  <item.icon className="h-4 w-4 text-accent" strokeWidth={1.9} />
                </span>
                <span>
                  <span className="block text-[14.5px] font-medium text-ink">{item.title}</span>
                  <span className="mt-0.5 block text-[13.5px] leading-relaxed text-body">
                    {item.body}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* mini lead card — quiet product teaser */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: [0, -7, 0] }}
          transition={{
            opacity: { delay: 0.5, duration: 0.6, ease: EASE },
            y: { delay: 0.5, duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative w-full max-w-[400px] rounded-2xl border border-linline bg-white/90 p-5 shadow-[0_18px_44px_rgba(24,22,35,0.08)] backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-faint">
              Potential match
            </p>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-deep">
              91%
            </span>
          </div>
          <p className="mt-2.5 text-[15.5px] font-medium text-ink">
            Found-person record — Surat · Aug 14
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Age ✓", "Date ✓", "Location ✓", "Description ✓"].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-[#e9f7ef] px-2.5 py-1 text-[11.5px] font-medium text-success"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <p className="relative text-[12px] text-faint">
          Demonstration environment — no real records are searched, nothing is stored.
        </p>
      </aside>

      {/* ------------------------------------------------ form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <KhojMark className="h-7 w-7 text-ink" />
            <span className="text-[13px] font-semibold tracking-[0.26em] text-ink">KHOJ</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="rounded-2xl border border-linec bg-surface p-6 shadow-[0_10px_36px_rgba(24,22,35,0.06)] sm:p-8"
          >
            {/* mode tabs */}
            {mode !== "verify" && (
              <div className="relative mb-7 grid grid-cols-2 rounded-full bg-lav-chip p-1">
                {(
                  [
                    ["signin", "Sign in"],
                    ["signup", "Create account"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    className={cn(
                      "relative z-10 flex h-9 items-center justify-center rounded-full text-[14px] font-medium transition-colors",
                      mode === key ? "text-ink" : "text-body hover:text-ink"
                    )}
                  >
                    {mode === key && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(24,22,35,0.10)]"
                        transition={{ type: "spring", stiffness: 480, damping: 42 }}
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {/* ---------------------------------------- sign in */}
              {mode === "signin" && (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  onSubmit={submitSignIn}
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
                      Welcome back
                    </h2>
                    <p className="mt-1 text-[14px] text-body">
                      Sign in to continue your investigation.
                    </p>
                  </div>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Password" error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(inputCls, "pr-11")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <SubmitButton
                    status={status}
                    idle="Sign in"
                    loading="Signing in…"
                    success="Signed in"
                  />
                </motion.form>
              )}

              {/* ---------------------------------------- sign up */}
              {mode === "signup" && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  onSubmit={submitSignUp}
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
                      Create your account
                    </h2>
                    <p className="mt-1 text-[14px] text-body">
                      Start an investigation in minutes.
                    </p>
                  </div>
                  <Field label="Full name" error={errors.name}>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Password" error={errors.password}>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <SubmitButton
                    status={status}
                    idle="Create account"
                    loading="Creating account…"
                    success="Account created"
                  />
                </motion.form>
              )}

              {/* ---------------------------------------- verify */}
              {mode === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="space-y-5"
                >
                  <div>
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 24 }}
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft"
                    >
                      <Check className="h-5 w-5 text-accent-deep" strokeWidth={2.4} />
                    </motion.span>
                    <h2 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
                      Verify your email
                    </h2>
                    <p className="mt-1 text-[14px] leading-relaxed text-body">
                      We sent a 6-digit code to{" "}
                      <span className="font-medium text-ink">{email.trim() || "your email"}</span>.
                      Enter it below to continue.
                    </p>
                  </div>
                  <OtpInput disabled={verifying} onComplete={(code) => verifyCode(code)} />
                  <AnimatePresence initial={false}>
                    {otpError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[12.5px] text-[#b3261e]"
                      >
                        {otpError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => verifyCode("")}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-medium text-white transition-colors hover:bg-accent-deep disabled:opacity-70"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify and continue
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-between text-[12.5px] text-faint">
                    <span>Demo — any 6 digits work.</span>
                    <button
                      type="button"
                      className="font-medium text-accent-deep hover:underline"
                      onClick={() => setOtpError("No real email is sent in this demo.")}
                    >
                      Resend code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="mt-6 text-center text-[12.5px] leading-relaxed text-faint">
            Demo environment — no real emails are sent, and credentials stay in your
            browser.{" "}
            <Link
              href="/"
              className="font-medium text-body underline decoration-linec underline-offset-2 transition-colors hover:text-ink"
            >
              Back to the landing page
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

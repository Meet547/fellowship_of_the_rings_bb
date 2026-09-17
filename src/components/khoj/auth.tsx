"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Btn, Logo, ScriptNote, useToast } from "./ui";
import type { Navigate } from "@/lib/khoj/router";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.86 3.16-.77 1.48.12 2.61.7 3.36 1.8-3.02 1.83-2.32 5.83.47 6.97-.56 1.5-1.29 2.99-2.07 4.17ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  );
}

function SkylineSketch() {
  /* hand-drawn feel city skyline line-art */
  return (
    <svg
      viewBox="0 0 900 120"
      className="h-auto w-full text-ink/25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M0 118 L0 96 L38 96 L38 78 L70 78 L70 96 L110 96 L110 60 L118 60 L118 52 L132 44 L146 52 L146 60 L154 60 L154 96" />
      <path d="M154 96 L154 70 L200 70 L200 96" />
      <path d="M200 96 L200 40 C200 30 224 30 224 40 L224 96" />
      <path d="M212 30 L212 22 M206 96 L218 96" />
      <path d="M224 96 L224 66 L268 66 L268 96" />
      <path d="M268 96 L268 50 L282 50 L282 38 L296 38 L296 50 L310 50 L310 96" />
      <path d="M310 96 L310 74 L356 74 L356 96" />
      <path d="M356 96 L356 34 C356 18 388 18 388 34 L388 96" />
      <path d="M366 34 L378 34 M372 26 L372 18" />
      <path d="M388 96 L388 62 L432 62 L432 96" />
      <path d="M432 96 L432 48 L470 48 L470 96" />
      <path d="M444 48 L458 48 M451 40 L451 30" />
      <path d="M470 96 L470 72 L520 72 L520 96" />
      <path d="M520 96 L520 44 C520 32 548 32 548 44 L548 96" />
      <path d="M548 96 L548 66 L592 66 L592 96" />
      <path d="M592 96 L592 52 L606 52 L606 40 L620 40 L620 52 L634 52 L634 96" />
      <path d="M634 96 L634 76 L680 76 L680 96" />
      <path d="M680 96 L680 42 C680 26 712 26 712 42 L712 96" />
      <path d="M690 42 L702 42 M696 34 L696 26" />
      <path d="M712 96 L712 64 L756 64 L756 96" />
      <path d="M756 96 L756 54 L794 54 L794 96" />
      <path d="M794 96 L794 70 L842 70 L842 96" />
      <path d="M842 96 L842 56 L868 56 L868 44 L882 44 L882 96" />
      <path d="M882 96 L900 96" />
      {/* window dots */}
      <g strokeWidth="1.1">
        <path d="M212 46 L216 46 M212 56 L216 56 M212 66 L216 66" />
        <path d="M368 44 L372 44 M368 56 L372 56 M368 68 L372 68" />
        <path d="M530 52 L534 52 M530 64 L534 64 M530 76 L534 76" />
        <path d="M692 52 L696 52 M692 64 L696 64 M692 76 L696 76" />
        <path d="M288 58 L292 58 M288 70 L292 70" />
        <path d="M612 60 L616 60 M612 72 L616 72" />
        <path d="M118 68 L122 68 M118 78 L122 78" />
        <path d="M482 56 L486 56 M482 68 L486 68" />
        <path d="M804 78 L808 78 M804 86 L808 86" />
        <path d="M872 62 L876 62 M872 74 L876 74" />
      </g>
    </svg>
  );
}

export default function Auth({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState<"signin" | "create">("signin");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const pill = { signin: false, create: true } as const;

  return (
    <div className="relative flex min-h-screen flex-col bg-paper">
      <button
        onClick={() => navigate("landing")}
        className="group absolute left-6 top-6 z-10 inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-ink2 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
        Back
      </button>

      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 py-14">
        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <Logo size="lg" />
        </motion.div>

        {/* card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 rounded-[20px] border border-line bg-card p-6 shadow-[0_24px_60px_-40px_rgba(35,32,27,0.35)]"
        >
          {/* tabs */}
          <div className="relative grid grid-cols-2 rounded-[12px] border border-line bg-paper2 p-1">
            {(["signin", "create"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative z-10 h-9 cursor-pointer rounded-[9px] text-[12.5px] font-medium transition-colors duration-300 ${
                  tab === t ? "text-ink" : "text-ink3 hover:text-ink2"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="auth-tab"
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 -z-10 rounded-[9px] border border-line bg-card shadow-[0_4px_14px_-6px_rgba(35,32,27,0.25)]"
                  />
                )}
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim() || password.length < 6) {
                toast("Enter an email and a password with at least 6 characters.");
                return;
              }
              window.localStorage.setItem("khoj-authenticated", "true");
              navigate("dashboard");
            }}
          >
            {pill[tab] && (
              <div className="relative">
                <UserRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
                <input
                  placeholder="Full name"
                  className="h-11 w-full rounded-[10px] border border-line bg-paper2 pl-10 pr-3.5 text-[13.5px] text-ink placeholder:text-ink3 transition-all hover:border-ink/25 focus:border-ink/45 focus:outline-none focus:ring-4 focus:ring-rust/10"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
              <input
                type="email"
                placeholder="Email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-[10px] border border-line bg-paper2 pl-10 pr-3.5 text-[13.5px] text-ink placeholder:text-ink3 transition-all hover:border-ink/25 focus:border-ink/45 focus:outline-none focus:ring-4 focus:ring-rust/10"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="h-11 w-full rounded-[10px] border border-line bg-paper2 pl-10 pr-11 text-[13.5px] text-ink placeholder:text-ink3 transition-all hover:border-ink/25 focus:border-ink/45 focus:outline-none focus:ring-4 focus:ring-rust/10"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-ink3 transition-colors hover:text-ink"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="flex justify-end pt-0.5">
              <button type="button" onClick={() => toast("Password reset will be sent when authentication is connected.")} className="link-sweep cursor-pointer text-[11.5px] text-ink2 hover:text-ink">
                Forgot password?
              </button>
            </div>

            <Btn type="submit" arrow className="w-full">
              {tab === "signin" ? "Sign In" : "Create Account"}
            </Btn>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[11px] text-ink3">Or continue with</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="space-y-3">
            {[
              { icon: <GoogleIcon />, label: "Continue with Google" },
              { icon: <AppleIcon />, label: "Continue with Apple" },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  window.localStorage.setItem("khoj-authenticated", "true");
                  navigate("dashboard");
                }}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border border-line bg-paper2 text-[13px] font-medium text-ink transition-all duration-300 hover:border-ink/30 hover:bg-card active:scale-[0.99]"
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-center text-[10.5px] leading-relaxed text-ink3">
            By signing in, you agree to our{" "}
            <button type="button" onClick={() => toast("Terms of use will be available before launch.")} className="cursor-pointer underline underline-offset-2 hover:text-ink2">Terms</button>{" "}
            and{" "}
            <button type="button" onClick={() => toast("Privacy policy details will be available before launch.")} className="cursor-pointer underline underline-offset-2 hover:text-ink2">Privacy Policy</button>.
          </p>
        </motion.div>
      </div>

      {/* skyline footer */}
      <div className="relative mx-auto w-full max-w-[860px] px-6 pb-2">
        <ScriptNote rotate={-3} className="absolute -top-7 right-10 text-[20px] text-ink2">
          &ldquo;Har kahaani, ek ghar dhoondti hai.&rdquo;
        </ScriptNote>
        <SkylineSketch />
        <div className="mx-auto h-px w-full bg-line" />
      </div>

      {/* hidden arrow helper for submit button consistency */}
      <span className="hidden">
        <ArrowRight size={0} />
      </span>
    </div>
  );
}

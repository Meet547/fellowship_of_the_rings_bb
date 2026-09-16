"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { HandNote, Logo } from "./shared";
import { useKhoj } from "@/lib/khoj/store";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1-.8 2.6-2.4 3.7l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.9 3C3.2 21.3 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.1 14.4c-.3-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4l-3.9-3C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l3.9-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l3.9 3c1-2.9 3.7-4.9 6.9-4.9z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function AuthShell({
  side,
  note,
  children,
  onBack,
}: {
  side: "mountains" | "person";
  note: string;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[420px_1fr]">
      {/* Left image panel */}
      <div className="khoj-grain relative hidden overflow-hidden lg:block">
        { }
        <img
          src={side === "mountains" ? "/images/auth-mountains.jpg" : "/images/auth-person.jpg"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
        <div className="absolute left-7 top-1/2 -translate-y-1/2">
          <HandNote size={30} rotate={-6} className="max-w-[150px] text-[#f7f5ef] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            {note}
          </HandNote>
          <span className="mt-4 block h-px w-10 bg-white/60" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex min-h-screen flex-col px-6 py-7 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo tagline={false} onClick={onBack} />
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SignIn() {
  const { navigate, signInDemo, setAuth, authEmail } = useKhoj();
  const [email, setEmail] = useState(authEmail);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErr("Please enter your email and password to continue.");
      return;
    }
    setErr("");
    setLoading(true);
    setTimeout(() => {
      setAuth({ authEmail: email });
      signInDemo();
      useKhoj.getState().navigate("dashboard");
    }, 700);
  };

  return (
    <AuthShell side="person" note={"Hope travels further together."} onBack={() => navigate("landing")}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.21, 0.65, 0.35, 1] }}
      >
        <div className="flex items-center justify-end text-[12.5px] text-ink-soft">
          <span className="mr-1.5">New here?</span>
          <button
            onClick={() => navigate("signup")}
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Create an account
          </button>
        </div>

        <h1 className="mt-8 text-[30px] font-semibold tracking-[-0.02em]">Welcome back</h1>
        <p className="mt-2 text-[13.5px] text-ink-soft">
          Sign in to continue your journey.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="si-email" className="text-[12px] font-medium text-ink-2">
              Email
            </label>
            <input
              id="si-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="si-pass" className="text-[12px] font-medium text-ink-2">
                Password
              </label>
              <button
                type="button"
                onClick={() => setErr("Password reset link sent to your email (demo).")}
                className="text-[11.5px] text-ink-faint transition-colors hover:text-ink"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative mt-1.5">
              <input
                id="si-pass"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line-2 bg-white px-4 py-3 pr-11 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {err && <p className="text-[12px] text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink py-3.5 text-[13.5px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-all hover:bg-black hover:shadow-[0_18px_36px_-14px_rgba(20,19,17,0.65)] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] text-ink-faint">
          <span className="h-px flex-1 bg-line-2" /> or <span className="h-px flex-1 bg-line-2" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setAuth({ authEmail: "meet@example.com" });
              signInDemo();
              navigate("dashboard");
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white py-3 text-[13px] font-medium transition-all hover:border-ink/40 hover:bg-[#faf9f6]"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            onClick={() => {
              setAuth({ authEmail: "meet@example.com" });
              signInDemo();
              navigate("dashboard");
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white py-3 text-[13px] font-medium transition-all hover:border-ink/40 hover:bg-[#faf9f6]"
          >
            <AppleIcon /> Continue with Apple
          </button>
        </div>
      </motion.div>
    </AuthShell>
  );
}

export function SignUp() {
  const { navigate, signUp, setAuth } = useKhoj();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 4) {
      setErr("Please fill in your name, a valid email and a password (4+ characters).");
      return;
    }
    setErr("");
    setLoading(true);
    setTimeout(() => {
      setAuth({ authEmail: email });
      signUp(name, email);
      navigate("onboarding");
    }, 700);
  };

  return (
    <AuthShell side="mountains" note={"Some people. Brighter tomorrows."} onBack={() => navigate("landing")}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.21, 0.65, 0.35, 1] }}
      >
        <div className="flex items-center justify-end text-[12.5px] text-ink-soft">
          <span className="mr-1.5">Already have an account?</span>
          <button
            onClick={() => navigate("signin")}
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </div>

        <h1 className="mt-8 text-[30px] font-semibold tracking-[-0.02em]">
          Create your account
        </h1>
        <p className="mt-2 text-[13.5px] text-ink-soft">
          Join thousands helping to reunite people.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="su-name" className="text-[12px] font-medium text-ink-2">
              Full name
            </label>
            <input
              id="su-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="su-email" className="text-[12px] font-medium text-ink-2">
              Email
            </label>
            <input
              id="su-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="su-pass" className="text-[12px] font-medium text-ink-2">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="su-pass"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line-2 bg-white px-4 py-3 pr-11 text-[13.5px] outline-none transition-all placeholder:text-ink-faint focus:border-ink/50 focus:ring-4 focus:ring-ink/5"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {err && <p className="text-[12px] text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink py-3.5 text-[13.5px] font-medium text-[#f4f2ee] shadow-[0_14px_30px_-14px_rgba(20,19,17,0.55)] transition-all hover:bg-black hover:shadow-[0_18px_36px_-14px_rgba(20,19,17,0.65)] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] text-ink-faint">
          <span className="h-px flex-1 bg-line-2" /> or <span className="h-px flex-1 bg-line-2" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setAuth({ authEmail: "meet@example.com" });
              signUp("Meet Pardeshi", "meet@example.com");
              navigate("onboarding");
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white py-3 text-[13px] font-medium transition-all hover:border-ink/40 hover:bg-[#faf9f6]"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            onClick={() => {
              setAuth({ authEmail: "meet@example.com" });
              signUp("Meet Pardeshi", "meet@example.com");
              navigate("onboarding");
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white py-3 text-[13px] font-medium transition-all hover:border-ink/40 hover:bg-[#faf9f6]"
          >
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <p className="mt-6 text-center text-[11.5px] text-ink-faint">
          By signing up, you agree to our{" "}
          <span className="underline underline-offset-2">Terms</span> and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>
        </p>
      </motion.div>
    </AuthShell>
  );
}

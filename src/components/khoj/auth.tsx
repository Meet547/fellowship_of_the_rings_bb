"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  Button,
  EASE,
  HandNote,
  Logo,
  OrDivider,
  fieldCls,
  labelCls,
} from "./shared";
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

function SocialRow({ onPick }: { onPick: () => void }) {
  return (
    <div className="space-y-2.5">
      <button
        onClick={onPick}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/15 py-3 text-[13px] font-medium text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <button
        onClick={onPick}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/15 py-3 text-[13px] font-medium text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
      >
        <AppleIcon /> Continue with Apple
      </button>
    </div>
  );
}

function AuthShell({
  side,
  quote,
  caption,
  children,
  onBack,
}: {
  side: "mountains" | "person";
  quote: string;
  caption: string;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[440px_1fr]">
      {/* Left image panel */}
      <div className="khoj-grain relative hidden overflow-hidden lg:block">
        <img
          src={side === "mountains" ? "/images/auth-mountains.jpg" : "/images/auth-person.jpg"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent p-9 pt-40 text-paper">
          <HandNote size={30} rotate={-5} className="max-w-[220px] text-paper">
            {quote}
          </HandNote>
          <div className="micro mt-6 !text-[9px] text-paper/70">{caption}</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex min-h-screen flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo tagline={false} onClick={onBack} />
          <button
            onClick={onBack}
            className="micro flex items-center gap-2 !text-[9.5px] text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          {children}
        </div>
        <div className="mx-auto w-full max-w-[400px]">
          <div className="micro !text-[8.5px] text-ink-faint">
            © 2026 Khoj — People. Connected.
          </div>
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

  const social = () => {
    setAuth({ authEmail: "meet@example.com" });
    signInDemo();
    navigate("dashboard");
  };

  return (
    <AuthShell
      side="person"
      quote="Hope travels further together."
      caption="Fig. 02 — On the way home"
      onBack={() => navigate("landing")}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-center justify-end text-[12.5px] text-ink-soft">
          <span className="mr-1.5">New here?</span>
          <button
            onClick={() => navigate("signup")}
            className="link-sweep font-semibold text-ink"
          >
            Create an account
          </button>
        </div>

        <h1 className="display-xl mt-9 text-[42px]">Welcome back</h1>
        <p className="mt-2.5 text-[13.5px] text-ink-soft">
          Sign in to continue your journey.
        </p>

        <form onSubmit={submit} className="mt-9 space-y-5" noValidate>
          <div>
            <label htmlFor="si-email" className={labelCls}>
              Email
            </label>
            <input
              id="si-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldCls + " mt-2"}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="si-pass" className={labelCls}>
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
            <div className="relative mt-2">
              <input
                id="si-pass"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldCls + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {err && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-2 border-[#b3402f] pl-3 text-[12px] text-[#b3402f]"
            >
              {err}
            </motion.p>
          )}

          <Button type="submit" disabled={loading} className="w-full !py-3.5" magnetic>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <OrDivider />

        <SocialRow onPick={social} />
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

  const social = () => {
    setAuth({ authEmail: "meet@example.com" });
    signUp("Meet Pardeshi", "meet@example.com");
    navigate("onboarding");
  };

  return (
    <AuthShell
      side="mountains"
      quote="Some people. Brighter tomorrows."
      caption="Fig. 03 — The road ahead"
      onBack={() => navigate("landing")}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-center justify-end text-[12.5px] text-ink-soft">
          <span className="mr-1.5">Already have an account?</span>
          <button
            onClick={() => navigate("signin")}
            className="link-sweep font-semibold text-ink"
          >
            Sign in
          </button>
        </div>

        <h1 className="display-xl mt-9 text-[42px]">Create account</h1>
        <p className="mt-2.5 text-[13.5px] text-ink-soft">
          Join thousands helping to reunite people.
        </p>

        <form onSubmit={submit} className="mt-9 space-y-5" noValidate>
          <div>
            <label htmlFor="su-name" className={labelCls}>
              Full name
            </label>
            <input
              id="su-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldCls + " mt-2"}
            />
          </div>
          <div>
            <label htmlFor="su-email" className={labelCls}>
              Email
            </label>
            <input
              id="su-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldCls + " mt-2"}
            />
          </div>
          <div>
            <label htmlFor="su-pass" className={labelCls}>
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="su-pass"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldCls + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {err && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-2 border-[#b3402f] pl-3 text-[12px] text-[#b3402f]"
            >
              {err}
            </motion.p>
          )}

          <Button type="submit" disabled={loading} className="w-full !py-3.5" magnetic>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <OrDivider />

        <SocialRow onPick={social} />

        <p className="mt-7 text-center text-[11.5px] leading-relaxed text-ink-faint">
          By signing up, you agree to our{" "}
          <span className="underline underline-offset-2">Terms</span> and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>
        </p>
      </motion.div>
    </AuthShell>
  );
}

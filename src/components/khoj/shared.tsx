"use client";

import { motion } from "framer-motion";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceKind } from "@/lib/khoj/data";

/* ---------------- Logo ---------------- */

export function Logo({
  size = "md",
  onClick,
  tagline = true,
}: {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  tagline?: boolean;
}) {
  const s = size === "lg" ? "text-[26px]" : size === "sm" ? "text-[17px]" : "text-[21px]";
  const tag =
    size === "lg" ? "text-[15px]" : size === "sm" ? "text-[11px]" : "text-[13px]";
  return (
    <button
      onClick={onClick}
      className={cn("flex items-baseline gap-2.5 group", onClick && "cursor-pointer")}
      aria-label="KHOJ home"
    >
      <span
        className={cn(
          "font-extrabold tracking-[0.08em] text-ink group-hover:opacity-70 transition-opacity",
          s
        )}
      >
        KHOJ
      </span>
      {tagline && (
        <span className={cn("text-ink-faint font-normal hidden sm:inline", tag)}>
          People. Connected.
        </span>
      )}
    </button>
  );
}

/* ---------------- Buttons ---------------- */

export function PillButton({
  children,
  onClick,
  variant = "dark",
  className,
  icon,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "light" | "ghost";
  className?: string;
  icon?: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full text-[13.5px] font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variant === "dark" &&
          "bg-ink text-[#f4f2ee] hover:bg-black shadow-[0_10px_24px_-12px_rgba(20,19,17,0.5)]",
        variant === "light" &&
          "bg-white text-ink border border-line-2 hover:border-ink/40 hover:bg-[#faf9f6]",
        variant === "ghost" && "text-ink-soft hover:text-ink",
        className
      )}
    >
      {children}
      {icon}
    </motion.button>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("h-3.5 w-3.5", className)}
      aria-hidden
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- Badges ---------------- */

export function MatchBadge({ pct }: { pct: number }) {
  const tone =
    pct >= 70
      ? "bg-match-green text-match-green-text"
      : pct >= 60
        ? "bg-match-amber text-match-amber-text"
        : "bg-match-yellow text-match-yellow-text";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
        tone
      )}
    >
      {pct}% match
    </span>
  );
}

export function SourceBadge({ source }: { source: SourceKind }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-2">
      <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-ink text-[#f4f2ee]">
        <svg viewBox="0 0 10 10" className="h-2 w-2" fill="currentColor" aria-hidden>
          <path d="M5 0l1.2 3.1L9.5 3.4 7.1 5.6l.7 3.2L5 7.1 2.2 8.8l.7-3.2L.5 3.4l3.3-.3L5 0z" />
        </svg>
      </span>
      {source}
    </span>
  );
}

/* ---------------- Silhouette placeholder ---------------- */

export function Silhouette({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-b from-[#2b2a27] to-[#111009]",
        className
      )}
      aria-label="Unidentified person silhouette"
    >
      <svg viewBox="0 0 64 64" className="h-3/5 w-3/5 text-[#4a4844]" fill="currentColor" aria-hidden>
        <circle cx="32" cy="22" r="12" />
        <path d="M10 58c2.5-12.5 11-19 22-19s19.5 6.5 22 19v6H10v-6z" />
      </svg>
    </div>
  );
}

/* ---------------- Person photo ---------------- */

export function PersonPhoto({
  photo,
  name,
  className,
}: {
  photo: string | null;
  name: string;
  className?: string;
}) {
  if (!photo) return <Silhouette className={className} />;
  return (
     
    <img
      src={photo}
      alt={`Photo of ${name}`}
      className={cn("object-cover", className)}
      draggable={false}
    />
  );
}

/* ---------------- Stepper ---------------- */

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: string[];
  current: number;
  onStepClick?: (i: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="flex items-center gap-1.5 sm:gap-2.5">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <button
            key={label}
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick || i > current}
            className={cn(
              "flex items-center gap-2 rounded-full px-2 py-1 transition-colors",
              onStepClick && i <= current && "hover:bg-black/[0.04]"
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold transition-all duration-300",
                active && "bg-ink text-[#f4f2ee] scale-110",
                !active && done && "bg-ink/10 text-ink",
                !active && !done && "border border-line-2 text-ink-faint"
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "text-[13px] hidden md:inline",
                active ? "font-semibold text-ink" : "text-ink-faint"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------- Handwritten note ---------------- */

export function HandNote({
  children,
  className,
  rotate = -4,
  size = 22,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  size?: number;
}) {
  return (
    <span
      className={cn("font-hand leading-[1.05] text-ink animate-float inline-block", className)}
      style={
        {
          fontSize: size,
          "--hand-rot": `${rotate}deg`,
          transform: `rotate(${rotate}deg)`,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}

/* ---------------- Section reveal wrapper ---------------- */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.65, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Misc icons used across screens ---------------- */

export function SearchGlyph({ className }: { className?: string }) {
  return <Search className={cn("h-4 w-4", className)} strokeWidth={1.8} aria-hidden />;
}

export function UserGlyph({ className }: { className?: string }) {
  return <User className={cn("h-4 w-4", className)} strokeWidth={1.8} aria-hidden />;
}

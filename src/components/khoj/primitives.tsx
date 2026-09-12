import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Brand mark — a lens with a person-pin at its centre                       */
/* -------------------------------------------------------------------------- */

export function KhojMark({
  className,
  strokeWidth = 1.7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="16"
        cy="16"
        r="13.2"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* person-pin: head + tapering body, reads as a location pin */}
      <circle cx="16" cy="12.4" r="3.1" stroke="currentColor" strokeWidth={strokeWidth} />
      <path
        d="M9.8 21.6c1.3-3 3.5-4.5 6.2-4.5s4.9 1.5 6.2 4.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle cx="25.4" cy="6.6" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordClassName,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <KhojMark className={cn("h-7 w-7", markClassName)} />
      <span
        className={cn(
          "text-[15px] font-semibold tracking-[0.24em] text-ink",
          wordClassName
        )}
      >
        KHOJ
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Buttons — pill-shaped, per reference                                      */
/* -------------------------------------------------------------------------- */

type PillVariant = "accent" | "outline" | "chip" | "chipLav" | "ghostDark";

const pillStyles: Record<PillVariant, string> = {
  accent:
    "bg-accent text-white hover:bg-accent-deep shadow-[0_1px_2px_rgba(24,22,35,0.18)]",
  outline:
    "bg-white text-ink border border-linec hover:border-[#cfcddd] hover:bg-[#fbfbf9]",
  chip: "bg-lav-chip text-ink hover:bg-[#e9e7f8]",
  chipLav: "bg-white/70 text-ink hover:bg-white",
  ghostDark: "bg-white/10 text-white hover:bg-white/15",
};

export function PillButton({
  href,
  children,
  variant = "accent",
  className,
  arrow = "right",
  onClick,
  "aria-label": ariaLabel,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: PillVariant;
  className?: string;
  arrow?: "right" | "upright" | "none";
  onClick?: () => void;
  "aria-label"?: string;
}) {
  const inner = (
    <>
      <span className="whitespace-nowrap">{children}</span>
      {arrow === "right" && <ArrowRight className="h-4 w-4 -mr-1 shrink-0" strokeWidth={2} />}
      {arrow === "upright" && (
        <ArrowUpRight className="h-4 w-4 -mr-1 shrink-0" strokeWidth={2} />
      )}
    </>
  );
  const cls = cn(
    "group inline-flex h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    pillStyles[variant],
    className
  );
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Typography helpers                                                        */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-faint",
        className
      )}
    >
      {children}
    </p>
  );
}

/** Centered section heading + supporting line, per reference rhythm. */
export function SectionHeader({
  title,
  sub,
  id,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[680px] text-center", className)}>
      <h2
        id={id}
        className="text-balance text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-ink md:text-[40px]"
      >
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-4 max-w-[560px] text-pretty text-[17px] leading-[1.55] text-body md:text-lg">
          {sub}
        </p>
      )}
    </div>
  );
}

/** "Figure A / Mercury"-style caption used beside diagrams. */
export function FigureCaption({
  figure,
  label,
  className,
}: {
  figure: string;
  label: string;
  className?: string;
}) {
  return (
    <p className={cn("text-right text-[12px] leading-tight", className)}>
      <span className="block text-faint">{figure}</span>
      <span className="block font-medium text-ink">{label}</span>
    </p>
  );
}

/** Check icon row used across product mockups. */
export function MockCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("h-[15px] w-[15px] text-success", className)}
    >
      <circle cx="8" cy="8" r="7.2" fill="currentColor" opacity="0.12" />
      <path
        d="M4.8 8.2l2.1 2.1 4.3-4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

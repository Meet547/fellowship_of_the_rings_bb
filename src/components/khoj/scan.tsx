"use client";

import { Camera, CheckCircle2, ImageUp } from "lucide-react";
import { useRef } from "react";
import { ScriptNote, useToast } from "./ui";
import { SCAN_TIPS } from "@/lib/khoj/data";
import type { Navigate } from "@/lib/khoj/router";

export default function Scan({ navigate }: { navigate: Navigate }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-9">
      <h1 className="font-serif text-[26px] font-medium tracking-[-0.01em] text-ink">
        Scan &amp; Identify
      </h1>
      <p className="mt-1.5 max-w-[560px] text-[13px] leading-relaxed text-ink2">
        Found someone who may be missing? Upload a clear photo — image identification is
        coming soon. In the meantime, use{" "}
        <button
          type="button"
          onClick={() => navigate("find")}
          className="cursor-pointer underline underline-offset-2 hover:text-ink"
        >
          text search
        </button>{" "}
        to describe the person and search our database.
      </p>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.05fr_0.85fr_280px]">
        {/* upload */}
        <button
          onClick={() => fileInput.current?.click()}
          className="group cursor-pointer rounded-[18px] border border-line bg-card p-6 transition-shadow duration-500 hover:shadow-[0_24px_50px_-30px_rgba(35,32,27,0.35)]"
        >
          <div className="flex h-[248px] flex-col items-center justify-center gap-2.5 rounded-[14px] border border-dashed border-ink/25 bg-paper2 transition-all duration-300 group-hover:border-rust/45 group-hover:bg-peach/25">
            <span className="flex size-12 items-center justify-center rounded-full bg-card text-ink2 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <ImageUp size={20} strokeWidth={1.7} />
            </span>
            <span className="font-serif text-[20px] font-medium text-ink">Upload Photo</span>
            <span className="text-[12.5px] text-ink2">
              Drag &amp; drop an image, or click to browse
            </span>
            <span className="text-[11px] text-ink3">Supports JPG, PNG (max 10MB)</span>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(event) => {
            if (event.target.files?.[0]) {
              toast("Image scan is coming soon. Please use text search in Find a Person.");
              event.target.value = "";
            }
          }} />
        </button>

        {/* capture live */}
        <div>
          <div className="mb-3 text-[12.5px] font-semibold text-ink">Or capture live</div>
          <div className="relative flex h-[248px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[18px] border border-dashed border-ink/20 bg-paper2 text-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-line bg-card text-ink3 shadow-sm">
              <Camera size={22} strokeWidth={1.7} />
            </span>
            <p className="text-[13px] font-medium text-ink">Camera capture not available</p>
            <p className="max-w-[200px] text-[11.5px] leading-relaxed text-ink3">
              Live camera identification is coming soon.
            </p>
          </div>
        </div>

        {/* tips */}
        <div className="rounded-[18px] border border-line bg-card p-5">
          <div className="text-[13.5px] font-semibold text-ink">Tips for better results</div>
          <ul className="mt-3.5 space-y-3">
            {SCAN_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  strokeWidth={1.9}
                  className="mt-[1px] shrink-0 text-badgegt"
                />
                <span className="text-[12.5px] leading-relaxed text-ink2">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <ScriptNote rotate={-4} className="text-[21px]">
          &ldquo;Ek tasveer bhi kahaani bolti hai.&rdquo;
        </ScriptNote>
      </div>

      <span className="hidden">
        <Camera size={0} />
      </span>
    </div>
  );
}

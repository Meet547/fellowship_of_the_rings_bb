"use client";
import DraftInput from "./draft-input";
import type { Navigate } from "@/lib/khoj/router";
export default function Scan({ navigate }: { navigate: Navigate }) {
 return <div className="mx-auto max-w-[1120px] px-6 py-9"><h1 className="font-serif text-[26px] font-medium text-ink">Read a missing-person poster</h1><div className="mt-7 max-w-2xl rounded-[18px] border border-line bg-card p-6"><DraftInput navigate={navigate}/></div><p className="mt-5 text-xs text-ink3">Poster text extraction assists reporting. It does not identify a person from their face.</p></div>;
}

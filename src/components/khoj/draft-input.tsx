"use client";
import { useEffect, useRef, useState } from "react";
import { extractDraft, fileData, type ExtractedDraft } from "@/lib/khoj/api";
import type { Navigate } from "@/lib/khoj/router";

const fields = [["name","Name"],["age","Age / approximate range"],["gender","Gender (if stated)"],["last_seen_location","Last seen location"],["last_seen_date","Last seen date"],["clothing","Clothing"],["distinctive_marks","Identifying marks"],["description","Description"]];
export default function DraftInput({ navigate, mode = "image" }: { navigate: Navigate; mode?: "image" | "audio" | "text" }) {
  const [draft, setDraft] = useState<ExtractedDraft | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [verified, setVerified] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; abort.current?.abort(); if (timer.current) clearTimeout(timer.current); if (recorder.current?.state === "recording") recorder.current.stop(); stream.current?.getTracks().forEach(t => t.stop()); }; }, []);
  async function extract(file?: Blob) {
    setBusy(true); setError(""); setDraft(null); setVerified(false); abort.current?.abort(); abort.current = new AbortController();
    try { const input = file ? { input_type: mode as "image" | "audio", content_type: file.type, data: await fileData(file) } : { input_type: "text" as const, text }; const result = await extractDraft(input, abort.current.signal); if (mounted.current) setDraft(result); }
    catch (e) { if (mounted.current && !(e instanceof DOMException && e.name === "AbortError")) setError(e instanceof Error ? e.message : "Extraction failed."); }
    finally { if (mounted.current) setBusy(false); }
  }
  async function record() {
    if (recording) { recorder.current?.stop(); return; }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error("Recording is unavailable in this browser. Upload an audio file or use text.");
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm", "audio/mp4"].find(t => MediaRecorder.isTypeSupported(t));
      if (!type) { stream.current.getTracks().forEach(t => t.stop()); throw new Error("Upload a WAV, MP3 or MP4 recording, or use text."); }
      const rec = new MediaRecorder(stream.current, { mimeType: type, audioBitsPerSecond: 32000 });
      recorder.current = rec; const chunks: Blob[] = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => { stream.current?.getTracks().forEach(t => t.stop()); if (timer.current) clearTimeout(timer.current); if (mounted.current) { setRecording(false); void extract(new Blob(chunks, { type })); } };
      rec.onerror = () => { setError("Recording failed. Try uploading an audio file."); stream.current?.getTracks().forEach(t => t.stop()); setRecording(false); };
      rec.start(); setRecording(true); setError(""); timer.current = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 90000);
    } catch (e) { setError(e instanceof Error ? e.message : "Microphone permission is required."); }
  }
  function useDraft() {
    if (!draft || !verified) return;
    const form = { name: String(draft.name || ""), age: String(draft.age || ""), gender: String(draft.gender || ""), location: String(draft.last_seen_location || ""), date: String(draft.last_seen_date || ""), details: String(draft.description || ""), clothing: String(draft.clothing || ""), marks: String(draft.distinctive_marks || ""), medical: "", contact: "" };
    sessionStorage.setItem("khoj_report_draft", JSON.stringify(form)); sessionStorage.setItem("khoj_report_draft_step", "1"); navigate("report");
  }
  return <div className="space-y-4 text-left">
    <p className="text-sm leading-relaxed text-ink2">{mode === "image" ? "Upload a missing-person poster. Review and correct the text before creating a report." : mode === "audio" ? "Describe the person in English, Hindi or Hinglish. Record up to 90 seconds, then review the structured details." : "Describe the missing person in English, Hindi or Hinglish."} Nothing is submitted automatically.</p>
    {mode === "text" ? <><textarea aria-label="Describe the missing person" value={text} maxLength={4000} onChange={e => setText(e.target.value)} className="min-h-32 w-full rounded-xl border border-line bg-paper2 p-3"/><button disabled={busy || text.trim().length < 5} onClick={() => void extract()} className="rounded-full bg-rust px-5 py-2 text-sm text-white disabled:opacity-50">Extract details</button></> : <>
      {mode === "audio" && <button disabled={busy} onClick={() => void record()} className="rounded-full bg-rust px-5 py-2 text-sm text-white disabled:opacity-50">{recording ? "Stop and process recording" : "Record voice report"}</button>}
      <label className="block text-sm text-ink">{mode === "image" ? "Choose poster (JPG/PNG, max 3 MB)" : "Or upload audio (max 3 MB)"}<input type="file" disabled={busy || recording} accept={mode === "image" ? "image/jpeg,image/png" : "audio/webm,audio/mp4,audio/wav,audio/mpeg"} className="mt-2 block w-full rounded-xl border border-line bg-paper2 p-3 text-xs" onChange={e => { const f = e.target.files?.[0]; if (f) void extract(f); e.target.value = ""; }}/></label>
    </>}
    {recording && <p role="status" className="text-sm text-rust">Recording… press stop when you finish.</p>}
    {busy && <p role="status" className="text-sm text-ink2">Reading the input… this may take up to three minutes.</p>}
    {error && <p role="alert" className="text-sm text-rust">{error}</p>}
    {draft && <div className="space-y-3 rounded-xl border border-line bg-paper2 p-4"><h3 className="font-serif text-xl">Review extracted details</h3>{draft.confidence_notes && <p className="text-sm text-rust">{String(draft.confidence_notes)}</p>}{fields.map(([key, label]) => <label key={key} className="block text-xs text-ink2">{label}<input className="mt-1 block w-full rounded-lg border border-line bg-card p-2 text-sm text-ink" value={String(draft[key] ?? "")} onChange={e => { setDraft({ ...draft, [key]: e.target.value }); setVerified(false); }}/></label>)}<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="mt-1"/>I checked these details and corrected uncertain information.</label><button disabled={!verified} onClick={useDraft} className="rounded-full bg-rust px-5 py-2 text-sm text-white disabled:opacity-40">Continue to report form</button></div>}
  </div>;
}

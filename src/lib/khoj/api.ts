import { fetchAuthSession } from "aws-amplify/auth";
import type {
  FoundReportPayload,
  FoundReportResponse,
  FoundReportsPage,
  MatchCandidate,
  MissingCasePayload,
  MissingCaseResponse,
  SearchResponse,
} from "./api-types";

/**
 * Public API Gateway endpoint for the currently deployed KHOJ backend.
 *
 * This is intentionally safe to ship in frontend code: it is a public HTTPS
 * endpoint, not an AWS credential or secret. NEXT_PUBLIC_API_BASE_URL can still
 * override it for another stage/environment.
 */
const DEFAULT_API_BASE_URL =
  "https://9zyg11hh53.execute-api.ap-southeast-2.amazonaws.com/dev";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

// Route browser requests through the Next.js rewrite proxy (/api/proxy/*) so
// the browser never makes a cross-origin request to API Gateway directly.
// This avoids CORS failures when the API Gateway Allow-Origin header does not
// match the current browser origin (e.g. localhost in dev).
// Server-side calls (SSR/API routes) still go direct because BASE_URL is set.
const isBrowser = typeof window !== "undefined";
const FETCH_BASE = isBrowser ? "/api/proxy" : BASE_URL;

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Server caps pages at 50; the Database page asks for 25 per page. */
const PAGE_LIMIT = 25;

// ─── User-facing error messages ───────────────────────────────────────────────

function userMessage(status: number): string {
  if (status === 401) return "Your sign-in session has expired. Please sign out and sign in again.";
  if (status === 429) return "Please wait a moment before trying again.";
  if (status === 400) return "Your request was invalid. Please check your inputs and try again.";
  if (status === 422)
    return "Not enough detail to search. Please add more information like age, gender, or location.";
  if (status >= 500) return "Something went wrong on our end. Please try again in a moment.";
  return "An unexpected error occurred. Please try again.";
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function authHeaders(forceRefresh = false): Promise<Record<string, string>> {
  const session = await fetchAuthSession({ forceRefresh });
  const token = session.tokens?.accessToken?.toString();
  if (!token) throw new ApiError(401, userMessage(401));
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/**
 * Send an authenticated API request. Amplify normally refreshes an expired
 * access token automatically, but browser tabs restored after a deployment can
 * retain stale cached state. On a 401 we force one refresh and retry exactly
 * once; the backend rejects the request before executing it, so this retry does
 * not duplicate a successful write.
 */
async function authenticatedFetch(
  input: string,
  init: Omit<RequestInit, "headers">,
): Promise<Response> {
  let headers: Record<string, string>;
  try {
    headers = await authHeaders();
  } catch {
    headers = await authHeaders(true);
  }

  let response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    response = await fetch(input, {
      ...init,
      headers: await authHeaders(true),
    });
  }
  return response;
}

async function apiFetch<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await authenticatedFetch(`${FETCH_BASE}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(
      res.status,
      "Server returned an unreadable response. Please try again.",
    );
  }

  if (!res.ok) {
    // Never expose Lambda/AWS/Python stack traces — use only our safe messages.
    throw new ApiError(res.status, userMessage(res.status));
  }

  return data as T;
}

/** Same transport as apiFetch but for GET requests with query parameters. */
async function apiGet<T>(
  path: string,
  query?: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const search = new URLSearchParams(query);
  const qs = search.toString();

  const res = await authenticatedFetch(`${FETCH_BASE}${path}${qs ? `?${qs}` : ""}`, {
    method: "GET",
    signal,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(
      res.status,
      "Server returned an unreadable response. Please try again.",
    );
  }

  if (!res.ok) {
    // Never expose Lambda/AWS/Python stack traces — use only our safe messages.
    throw new ApiError(res.status, userMessage(res.status));
  }

  return data as T;
}

// ─── Public API surface ───────────────────────────────────────────────────────

/**
 * POST /search with a plain-text description.
 * input_type is always "text" — image/audio paths are not yet implemented on the frontend.
 */
export async function searchByText(
  text: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return apiFetch<SearchResponse>("/search", { input_type: "text", text }, signal);
}

/**
 * POST /missing to create a new missing-person case.
 * Returns the generated case_id on HTTP 201.
 */
export async function createMissingCase(
  payload: MissingCasePayload,
  signal?: AbortSignal,
): Promise<MissingCaseResponse> {
  return apiFetch<MissingCaseResponse>("/missing", payload, signal);
}

/**
 * POST /found to create a user-submitted found-person report.
 * The backend rejects requests with no descriptive/identifying field (verified live,
 * HTTP 400) — callers should validate before invoking.
 * Returns the generated found_id on HTTP 201.
 */
export async function createFoundReport(
  payload: FoundReportPayload,
  signal?: AbortSignal,
): Promise<FoundReportResponse> {
  return apiFetch<FoundReportResponse>("/found", payload, signal);
}

/**
 * GET /found — paginated listing of found-person records.
 * The Lambda allowlists the response fields, so only frontend-safe data arrives;
 * it returns no total count, so the UI must never invent one.
 * @param cursor Opaque `next_cursor` from a previous page, for pagination.
 */
export async function getFoundReports(
  cursor?: string,
  signal?: AbortSignal,
): Promise<FoundReportsPage> {
  const query: Record<string, string> = {
    source: "ZIPNET",
    limit: String(PAGE_LIMIT),
  };
  if (cursor) query.cursor = cursor;
  return apiGet<FoundReportsPage>("/found", query, signal);
}

export { PAGE_LIMIT };

export type CaseSummary = { case_id: string; name?: string; status: string; monitoring_status?: string; monitoring_runs?: number; monitoring_limit?: number; next_check_at?: string; search_status?: string };
export type SavedMatch = { match_id: string; case_id: string; found_id: string; my_side: "missing" | "found"; can_consent: boolean; missing_consent: string; found_consent: string; created_at: string; strong: boolean; score: { final_score?: number; structured_score?: number; data_completeness?: number; structured_details?: unknown }; missing_summary: Record<string, unknown>; found_summary: Record<string, unknown>; shared_contact?: { email?: string }; missing_email_state?: string; found_email_state?: string };
export type DashboardData = { cases: CaseSummary[]; found_reports: { found_id: string; name?: string; search_status?: string }[]; matches: SavedMatch[]; stats: Record<string, number>; activity: { action: string; created_at: string }[]; email_mode: string };
export const getDashboard = (signal?: AbortSignal) => apiGet<DashboardData>("/dashboard", undefined, signal);
export const setCaseStatus = (case_id: string, action: string) => apiFetch("/case-status", { case_id, action });
export const setMatchConsent = (match_id: string, decision: "accepted" | "declined") => apiFetch("/consent", { match_id, decision });
export type ExtractedDraft = Record<string, string | number | null>;
export async function extractDraft(input: { input_type: "text" | "image" | "audio"; text?: string; content_type?: string; data?: string }, signal?: AbortSignal): Promise<ExtractedDraft> {
  const job = await apiFetch<{ job_id: string }>("/extract", input, signal);
  for (let i = 0; i < 90; i++) {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
      const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, 2000);
      if (signal?.aborted) onAbort(); else signal?.addEventListener("abort", onAbort, { once: true });
    });
    const status = await apiGet<{ status: string; draft?: ExtractedDraft }>("/jobs", { id: job.job_id }, signal);
    if (status.status === "completed" && status.draft) return status.draft;
    if (status.status === "failed") throw new Error("Could not read this input. Try a clearer image or recording, or enter the details manually.");
  }
  throw new Error("Extraction is taking longer than expected. Please try again later.");
}
export async function fileData(file: Blob): Promise<string> {
  if (file.size > 3 * 1024 * 1024) throw new Error("Choose a file smaller than 3 MB.");
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = () => reject(new Error("Could not read file")); reader.readAsDataURL(file); });
}

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
  if (status === 400) return "Your request was invalid. Please check your inputs and try again.";
  if (status === 422)
    return "Not enough detail to search. Please add more information like age, gender, or location.";
  if (status >= 500) return "Something went wrong on our end. Please try again in a moment.";
  return "An unexpected error occurred. Please try again.";
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${FETCH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  const res = await fetch(`${FETCH_BASE}${path}${qs ? `?${qs}` : ""}`, {
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

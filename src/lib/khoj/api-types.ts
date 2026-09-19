// ─── /search endpoint types ───────────────────────────────────────────────────

/**
 * Structured match criteria returned alongside each candidate.
 * Values are strings ("match", "strong", "close (N years)") or null.
 */
export interface StructuredDetails {
  gender?: string | null;
  age?: string | null;
  clothing?: string | null;
  location?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

/** A single unidentified or missing person record from the database. */
export interface MatchCandidate {
  found_id: string;
  name?: string | null;
  /** Age as a numeric range pair [min, max] or a plain string/number. */
  age_range?: [number, number] | null;
  age?: string | number | null;
  gender?: string | null;
  location?: string | null;
  date_found?: string | null;
  clothing?: string | null;
  description?: string | null;
  remarks?: string | null;
  complexion?: string | null;
  height_cm?: number | null;
  district?: string | null;
  state?: string | null;
  police_station?: string | null;
  source?: string | null;
  source_url?: string | null;
  /** Array of photo URLs (first element is the primary photo). */
  photo_urls?: string[] | null;
  [key: string]: string | number | boolean | string[] | [number, number] | null | undefined;
}

/** One result entry from the CPU matcher. Scores are on a 0–100 scale. */
export interface Match {
  /** Combined final score, 0–100. */
  final_score: number;
  /** Semantic similarity score, 0–100. */
  semantic_score: number;
  /** Structured attribute score, 0–100. */
  structured_score: number;
  /** Raw semantic similarity value before scaling, 0–100. */
  semantic_similarity?: number | null;
  /** Structured score after applying data-completeness weighting, 0–100. */
  effective_structured_score?: number | null;
  /** Fraction of structured fields present in the candidate record, 0–100. */
  data_completeness?: number | null;
  structured_details: StructuredDetails;
  candidate: MatchCandidate;
}

/** The "matching" block inside a SearchResponse. */
export interface MatchingResponse {
  status: string;
  count: number;
  matches: Match[];
}

/**
 * The extracted structured query the AI built from the raw input.
 * All fields are optional since they are only populated when explicitly present.
 */
export interface SearchQuery {
  name?: string | null;
  age?: string | number | null;
  gender?: string | null;
  last_seen_location?: string | null;
  last_seen_date?: string | null;
  clothing?: string | null;
  description?: string | null;
  original_language?: string | null;
  confidence_notes?: string | null;
}

/** Top-level response from POST /search. */
export interface SearchResponse {
  status: string;
  query: SearchQuery;
  matching: MatchingResponse;
  /** Populated only for input_type === "audio". */
  transcript?: string;
}

// ─── /found endpoint types ─────────────────────────────────────────────────────

/**
 * One page from GET /found.
 * The Lambda allowlists fields server-side, so no internal fields (e.g. embedding)
 * are present on the wire — this type mirrors exactly what the handler returns.
 * Verified live (2026-09-19): the deployed handler also echoes `source` and a `count`.
 */
export interface FoundReportsPage {
  items: MatchCandidate[];
  next_cursor: string | null;
  /** Echoed query parameter (deployed behavior, verified live). */
  source?: string;
  /** Number of items in this page (deployed behavior, verified live). */
  count?: number;
}

// ─── /missing endpoint types ──────────────────────────────────────────────────

/** Payload sent to POST /missing to create a new missing-person case. */
export interface MissingCasePayload {
  name: string;
  age: string;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  description: string;
  clothing?: string;
  /** Frontend form field "marks" mapped to this backend field name. */
  distinctive_marks?: string;
  medical?: string;
  contact: string;
}

/** Response body returned on HTTP 201 by POST /missing (verified live). */
export interface MissingCaseResponse {
  message: string;
  case_id: string;
  status: string;
  /** Live response also reports the direct-match run triggered on submission. */
  search_status?: string;
  match_count?: number;
  matches?: Match[];
}

// ─── /found POST endpoint types ───────────────────────────────────────────────

/**
 * Payload for POST /found — a user-submitted found-person report.
 * Mirrors the pipeline's canonical user-submitted shape (db_helpers.create_found_report):
 * the server assigns found_id (USER-{uuid}), source ("user_submitted") and record_subtype.
 * Verification gate: only send fields the user actually provided.
 */
export interface FoundReportPayload {
  name?: string;
  age?: string;
  gender?: string;
  location?: string;
  description?: string;
  clothing?: string;
  remarks?: string;
  /** Contact information for the finder/reporter (optional). */
  contact?: string;
}

/**
 * One match entry returned by POST /found. Verified live (2026-09-19):
 * entries are FLATTENED missing-case records with matcher scores inline —
 * unlike POST /search, there is no nested `candidate` object.
 */
export interface FoundReportMatch {
  case_id: string;
  source?: string | null;
  name?: string | null;
  gender?: string | null;
  age?: string | number | null;
  age_range?: [number, number] | null;
  height_cm?: number | null;
  complexion?: string | null;
  last_seen_location?: string | null;
  last_seen_date?: string | null;
  clothing?: string | null;
  distinctive_marks?: string | null;
  description?: string | null;
  photo_urls?: string[] | null;
  /** Combined similarity/ranking score, 0–100. NOT an identity probability. */
  final_score: number;
  semantic_score: number;
  structured_score: number;
  data_completeness?: number | null;
  structured_details?: Record<string, string | null>;
}

/**
 * Response body returned on HTTP 201 by POST /found.
 * Verified live (2026-09-19): matching runs SYNCHRONOUSLY at submission —
 * `search_status: "completed"` with ranked missing-case candidates in `matches`.
 */
export interface FoundReportResponse {
  message: string;
  found_id: string;
  status: string;
  search_status: string;
  match_count: number;
  matches: FoundReportMatch[];
}

# KHOJ — Phase 7: Complete and Harden the Frontend

> Date: 2026-09-19
> Scope: Frontend only (repo `khoj-3`). Backend was not modified; no deployment was performed.

## 1. Checks Performed

Read the authoritative contract (`KHOJ_Backend_Frontend_Handoff_2026.pdf`) and audited every
flow page against it and against the phase rules:

- Route/view inventory: landing, auth, dashboard, database, find, report, searching, match,
  found, scan — all read in full (`src/components/khoj/*`).
- Backend contract reconciliation: endpoint paths, methods, base URL, source/limit/cursor
  params, request/response shapes, and the "no new endpoints" rule.
- Wire-shape type adoption (`src/lib/khoj/api-types.ts`), single API layer (`src/lib/khoj/api.ts`),
  no direct `fetch`/`axios`/hardcoded hosts anywhere else.
- Database pagination contract: cursor-based (`next_cursor`), `limit` 1–100, `source = ZIPNET`
  preserved as the verified default; no page/offset.
- Copy honesty: searched for voice/photo/matching/feedback/contact/stat claims; inspected the
  image-matching and voice paths specifically.
- Mock/unused data removal: `PEOPLE`, `DB_STATS`, `Person` type removed; confirmed no dangling refs.
- Routing guard behavior (`src/lib/khoj/router.ts`): public = landing/auth/not-found; auth-gated
  views redirect to auth; authenticated users are redirected away from landing/auth.
- Accessibility: label↔input linkage, `aria-label` on placeholder-only controls, `role="status"`
  regions, toggle/status semantics.
- Security: `NEXT_PUBLIC_*` contents, `.env`/`.env.local` git tracking, single proxied API layer,
  old `src/app/api/route.ts` removed.
- Build/toolchain: `npx tsc --noEmit`, `npx eslint src --max-warnings=0`, `npm run build`
  (Next 16.1.3 / Turbopack) all pass.

## 2. Live Verified

Network calls made against the deployed API Gateway
(`https://9zyg11hh53.execute-api.ap-southeast-2.amazonaws.com/dev`):

- `GET /found?source=ZIPNET&limit=5` → 200. Response keys exactly
  `{source, count, items, next_cursor}`; `next_cursor` present (base64 token).
- Cursor pagination: page 2 requested with `next_cursor` returns the next contiguous page
  (ZIPNET-184962..184966) with no overlap; another `next_cursor` returned — infinite-scroll/Load-More
  cursor chain works end-to-end.
- `offset=99` is ignored by the server (returns the first page) → confirms the frontend must use
  only `source`/`limit`/`cursor`, never offset (matches implementation).
- Item shape confirmed: `found_id, location, police_station, state, district, date_found, age_range,
  gender, complexion, height_cm, clothing, remarks, description, source, source_url, photo_urls`.
- Embedding/secret columns (`embedding`, `embedding_model`, `embedding_text_hash`) are NOT present
  in API responses — the frontend never renders them.

The interactive POST flows (report → searching → match) were not re-driven here; they were wired
to the deployed contract from the previous integration pass and type-checked against the adopted
types.

## 3. Types Adopted

`src/lib/khoj/api-types.ts` (single source of truth, verified against live responses):

- `FoundReportMatch` (flat /found item shape — matches live output above).
- `MatchCandidate` (search/match shape) with photo handling and an index signature for
  defensive rendering of unmodeled matcher fields.
- `SearchResponse` (`items`, `next_cursor`), `FoundResponse`, `FoundQueryParams`.
- `Match` / `StructuredDetails` for the matcher's scored output (`final_score`,
  `semantic_score`, `structured_score`, semantic similarity).
- `MissingCaseResponse` (`message`, `case_id`, `status`, `search_status`, `match_count`, `matches`,
  `next_cursor`) for `POST /missing`.
- `SearchStatus` union (`pending`, `searching`, `no_searchable_information`, `awaiting_processing`,
  `completed`, `failed`) — rendered live in the report success state.

Defensive normalization: the report flow accepts BOTH the flat `/found`-style item and the nested
`{candidate: …}` shape returned under `POST /missing.matches`, since the deployed matcher's nesting
could not be inspected in the inaccessible backend account.

## 4. Behaviors Adopted

- **Database page**: skeleton loading, error + retry, empty state, cursor Load-More, list/grid
  toggle, India-map heatmap, client-side filters (state / age / gender / date / status),
  "X of Y loaded records shown", end-of-records notice, source fixed to the verified `ZIPNET`
  default via `api.ts`. Never uses offset; never renders embedding fields.
- **Single API layer**: all calls through `src/lib/khoj/api.ts`; browser requests go via the
  Next rewrite `/api/proxy/:path*` → `NEXT_PUBLIC_API_BASE_URL` (`next.config.ts`). `fetch` exists
  only inside `api.ts`.
- **Honest copy**: voice page states it's not connected; photo tab states image matching is not
  available yet; report photo step states photos are not sent/processed; scan page states live
  camera identification is coming soon; dashboard "Scan & Identify" card states photo ID is upcoming.
- **Match UX honesty**: "View Full Report" / "Compare Images" / "Report as Incorrect" disabled with
  honest toasts; feedback panel is local-only with an explanatory note; "Request Contact Details"
  notes contact requests are not yet available; every match carries a "similarity ranking, not
  identity confirmation — human verification required" caveat and "Potential Match" badge.
- **Report flow**: success state renders the returned `case_id` (copyable), live `search_status`
  with guidance for `no_searchable_information` / `awaiting_processing`, and any returned matches
  with Match-Score + disclaimer. Copy no longer claims real-time broadcast — "Your report has been
  received and checked against found-person records."
- **Dashboard/profile**: greeting uses the real Cognito name/initials via `useUserProfile()`
  (`src/lib/khoj/use-user.ts`) with graceful fallback; no fake stats; honest cards.
- **Auth**: Google/Apple social buttons only render when hosted UI + social providers are configured
  (`.env`); all inputs have labels/aria-labels.
- **Accessibility**: `Field` now links each label to its control via `useId`/`cloneElement`
  (`ui.tsx`); `aria-label` on placeholder-only inputs (find textarea/photo, auth name/password/
  verification code); `role="status"` on the searching progress line; accessible toggle/eye buttons.

## 5. Behaviors Avoided

- No invented endpoints, params, or headers — only the contract in the handoff.
- No `page`/`offset` pagination for the Database.
- No claiming image matching, voice search, notifications, contact requests, match-feedback
  persistence, NGO/police contact APIs, or case-detail/full-report APIs as working.
- No fake statistics/dashboard numbers; no hardcoded persona placeholders in identity contexts.
- No rendering of raw embedding/vector fields.
- No auto-redirect to a fabricated "case detail" page.

## 6. Unverified / Out of Scope (Not Done)

- **Backend live inspection**: account `743976413697` was inaccessible from the current role —
  deployed Lambdas/DynamoDB could not be inspected, so the exact `POST /missing` matcher match
  nesting remains unconfirmed (handled defensively, see Section 3).
- **Full live E2E re-run** of report → POST /missing → match rendering (blocked on backend access;
  coverage instead by type-check + contract types + the live-verified GET /found path).
- **Image matching, voice search, notifications, contact/full-report/feedback endpoints** — not
  implemented in the backend; intentionally left as honest placeholders.
- **Deployment**: no Amplify deploy performed (out of scope for this phase; all work is local and
  build-verified).

## 7. Assumptions

- The handoff document is the authoritative contract for endpoints and shapes.
- `GET /found` remains source-keyed; the ZIPNET default preserves the previously verified behavior.
- Match scores are similarity rankings (per handoff) and are presented as such, never as identities.
- New records reported to the missing index are not automatically embedded into the found index,
  so searchability is not promised for just-reported cases (`search_status` is shown instead).
- `.env` is tracked in git but contains only public `NEXT_PUBLIC_*` configuration and a local
  `DATABASE_URL` file path — no secrets (see Section 9 recommendation).
- `src/lib/db.ts` (Prisma) is legacy and unimported; it was not wired in.

## 8. README Handoff (recommendations for the next phase)

1. **Backend access**: add an IAM role for `743976413697` so the next phase can inspect the
   deployed matchers, confirm the `POST /missing` match nesting, and drop the defensive dual-shape
   normalization in `report.tsx` if it can be narrowed.
2. **Env hygiene**: `git rm --cached .env` and rely on Amplify environment variables; keep
   `.env.local` gitignored. (`.env` holds no secrets today, but tracking it invites drift.)
3. **Prisma cleanup**: delete `src/lib/db.ts` + the unused `@prisma/client` dependency, or wire it
   consciously; nothing imports it.
4. **Backend features to build next** (in priority order per the product): image matching, voice
   search, match-feedback persistence, contact-request routing to NGOs/police, case-detail access.
5. **Verification commands** for future work: `npx tsc --noEmit`, `npx eslint src --max-warnings=0`,
   `npm run build` (also copies `public` + `.next/static` into `standalone/`).

## 9. Backend Blockers

- No access to backend account `743976413697` → cannot inspect deployed Lambdas (`BharatTalaash-*`)
  or DynamoDB tables, cannot re-run the live missing-person E2E, and cannot confirm the exact
  `POST /missing` match response nesting. This is the single remaining blocker to full
  re-verification; the frontend is hardened against all shapes in the handoff regardless.

## 10. Report Confidence

- **Verified live**: GET /found response shape, cursor pagination, ZIPNET default, no embedding
  leakage, offset ignored.
- **Verified by build**: TypeScript (no errors), ESLint (0 warnings), production `next build`
  (success). All edits are in committed-working-tree files under `src/`; no deploy was made.
- **High confidence** that the frontend behaves consistently with the documented backend contract
  and never implies features the backend does not provide.
- **Deferred** (medium→high risk if backend were changed): re-running the full report→match flow
  against the live matcher once backend access is restored.
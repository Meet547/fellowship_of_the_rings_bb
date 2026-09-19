# Image-Search Backend Investigation

**Status:** investigation only — nothing implemented. Backend deployed code untouched.

## Goal

Enable the frontend "Upload Photo" flows (Find → photo tab, Scan & Identify) to run
real image-based matching against the existing matcher, using the already-deployed
`POST /search` endpoint with `input_type: "image"`.

## What already exists (verified)

### Backend — `POST /search` already accepts `input_type: "image"`

- `KHOJ_GitHub_Scripts/lambda/search_text.py:317-327` — the handler validates
  `input_type in ("text", "audio", "image")` and dispatches image input to
  `extract_from_image()`.
- `search_text.py:162-201` — `extract_from_image(bucket, key)`:
  - Requires `s3_bucket` + `s3_key` (the image must already live in S3 — there is no
    upload path in the API itself).
  - Downloads the object, base64-encodes it, and sends it to Bedrock (Claude Haiku,
    `MODEL_ID` at line 11) with the shared `EXTRACTION_PROMPT` plus an image-specific
    addendum ("missing-person poster / police notice / photograph / document — read
    visible text and describe visual characteristics").
  - Output: the same structured JSON the text path produces.
- From there the flow is **identical to text**: `build_matcher_query()` →
  `search_cpu_matcher()` (Lambda → SSM → EC2 matcher `POST /search`) → the standard
  `SearchResponse` the frontend already types (`src/lib/khoj/api-types.ts`).
- Gap on the wire: if `s3_bucket`/`s3_key` are missing, `extract_from_image` raises
  `ValueError`, which the handler maps to `400 {"error": "s3_bucket and s3_key are
  required for image input"}`.

### Frontend — both upload surfaces exist but are stubs (honest ones)

- `src/components/khoj/find.tsx` — photo tab: file input accepts JPG/PNG, then toasts
  "Image search is coming soon"; its Search Now button always toasts.
- `src/components/khoj/scan.tsx` — upload: toasts "Image scan is coming soon";
  camera capture card is a static "coming soon" panel.
- `src/lib/khoj/api.ts` — `searchByText()` only ever sends `input_type: "text"`;
  `apiFetch` is POST-JSON-only and has no multipart/binary support.

### Matcher — text-embedding based

- `KHOJ_GitHub_Scripts/matcher/matchingfinal.py` — the engine embeds a **text** query
  (`QueryEmbedder`, line 294) and compares against stored **text-derived** embeddings
  of FoundReport records. The stored `embedding` attribute is produced by
  `embedding_worker` / `gpu_embedding_job.py` from the record's text fields.
- Consequence: image search through the current pipeline is really
  **image → (Bedrock vision) → text description → text embedding** matching. The
  image never becomes a visual vector; match quality is bounded by how well Claude's
  description maps onto FoundReport text fields.

## Design decision required (open question)

**Option A — ride the existing vision→text pipeline (recommended first step)**

- Frontend uploads the photo, backend extracts attributes via the existing Bedrock
  image path, then runs the unchanged matcher. No matcher changes, no re-embedding.
- Cost: match quality limited to text-attribute overlap (age/gender/clothing/
  location). Faces are never compared.

**Option B — true visual matching (larger project)**

- Generate face/visual embeddings (e.g. a face-recognition model on the GPU EC2 box,
  which already runs embedding jobs via `gpu_controller.py`), store a second vector
  attribute on FoundReport, and add a visual-similarity stage to the matcher.
- Requires: model choice, new stored attribute + backfill for all records, matcher
  two-stage scoring, GPU capacity, privacy review (biometric data).

## Missing pieces for Option A (the minimum viable path)

1. **Image upload endpoint.** The browser cannot call S3 directly (no credentials in
   the frontend, by design). Options:
   - a new Lambda + API Gateway route (`POST /upload` → pre-signed S3 PUT URL, or
     base64-in-JSON passthrough ≤ ~6 MB Lambda payload), or
   - a Next.js route handler that streams to S3 using a server-side role — but the
     current architecture keeps AWS access entirely off the Next.js server, so the
     Lambda route fits the existing pattern better.
2. **`api.ts` support** — a `searchByImage(bucket, key)` (or presigned-flow) client
   function reusing the `/api/proxy` transport; `apiFetch` stays JSON-only, so this
   is a sibling helper, not a change to existing functions.
3. **Frontend wiring** — Find photo tab and Scan upload set
   `searchContext.results/error` and navigate to `searching` exactly like the text
   flow; `Searching` needs a zero-change passthrough if the context shape is reused
   (the response body is identical `SearchResponse`).
4. **Cleanup of `Searching`'s persistence contract** — it currently persists only a
   text query (`khoj_search_query`); an image search must either persist nothing
   (acceptable: refresh shows "session expired") or persist an s3 key reference.
   Decision needed; simplest honest behavior is the former.

## Key risks / open questions

- **Payload size:** base64-in-JSON through API Gateway + Lambda is capped (~10 MB
  gateway, ~6 MB Lambda). Pre-signed PUT avoids this; a 10 MB frontend limit means
  server-side downscale/re-encode may be needed anyway.
- **S3 bucket hygiene:** uploads need a dedicated bucket/prefix, lifecycle rules
  (auto-delete after N days), and no public access. Which bucket exists today is
  not visible in the repo (no IaC) — requires a console check.
- **Abuse/cost:** vision calls cost more than text; rate-limit or auth-gate image
  searches (all users are authenticated Cognito users already).
- **No IaC:** every new route/bucket/permission is a manual console step, like
  `GET /found` was — the runbook pattern from that deployment applies.

## Recommended investigation order

1. Confirm in the AWS console which S3 bucket(s) exist and their policies.
2. Decide upload mechanism (pre-signed PUT vs base64 passthrough).
3. Prototype `extract_from_image` end-to-end with a real poster photo via a direct
   Lambda test event (no frontend) and inspect extraction quality on 5-10 samples.
4. Only then build the upload Lambda + API route + frontend wiring.

*Nothing in this document has been implemented; no files outside `docs/` were touched.*

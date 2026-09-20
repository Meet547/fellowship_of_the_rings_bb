# Bharat Talaash application backend

This package extends the existing Lambda, DynamoDB and CPU matching services.
It uses the existing `MissingCase`, `FoundReport`, `Match` and `User`
tables.

## API routes

- `POST /missing` and `POST /found`: validate, deduplicate and save a
  signed-in user's report, then queue matching.
- `POST /search`: extract multilingual structured details and search the
  found-record index.
- `GET /dashboard`: return only the signed-in user's cases, reports, matches
  and activity.
- `POST /case-status`: apply `satisfied`, `not_satisfied`, `stop` or
  `matched`.
- `POST /consent`: record one reporter's decision. Contact email is returned
  only after both report owners accept.
- `POST /extract` and `GET /jobs?id=...`: asynchronously extract an editable
  report draft from text, a poster or recorded audio.

Every private route validates the Cognito access token with `GetUser`, checks
record ownership, rate limits per user, and returns responses without private
contact fields. Candidate scores rank records and never confirm identity.

## Background work

The same handler accepts IAM-invoked internal tasks for report matching,
official-source index refresh, extraction and two-day incremental monitoring.
The scheduler target must send `{"task":"monitor"}`.

Required environment variables are `COGNITO_POOL_ID`,
`COGNITO_CLIENT_ID`, `WORKER_FUNCTION`, `MATCHER_INSTANCE_ID`,
`UPLOAD_BUCKET`, `FRONTEND_URL`, `EMAIL_FROM` and `EMAIL_MODE`.
Uploaded media uses the private S3 prefix `private-inputs/<user-id>/` and is
deleted after extraction.

Run local validation with:

```sh
python -m compileall -q KHOJ_GitHub_Scripts/backend
npx tsc --noEmit
npm run build
```

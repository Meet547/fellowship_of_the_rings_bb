# KHOJ AWS Architecture

KHOJ uses only the AWS services shown in the project reference:

| Service | Responsibility |
| --- | --- |
| Amplify | Host the Next.js frontend and environment configuration |
| Cognito | Sign-up, sign-in, email verification, and user identity |
| API Gateway | Public HTTPS API boundary |
| Lambda | Validate requests and run small server-side handlers |
| Step Functions | Orchestrate intake, search, matching, scoring, and notifications |
| Bedrock | Extract case fields, compare evidence, and generate grounded explanations |
| OpenSearch | Keyword and semantic retrieval over authorized source records |
| DynamoDB | Cases, workflow status, leads, evidence links, and audit events |
| S3 | Uploaded images, documents, and source snapshots |
| EventBridge | New-data workflow triggers |
| EventBridge Scheduler | Periodic re-checks for unresolved cases |
| Cedar | Citizen, police, and admin authorization policies |

## Current application boundary

The frontend calls:

- `POST /api/investigations` to create a run and start the workflow.
- `POST /api/chat` to ask a grounded question about a case.

When `AWS_REGION`, `KHOJ_CASES_TABLE`, and `KHOJ_STATE_MACHINE_ARN` are configured,
the investigation route writes the run metadata to DynamoDB and starts Step
Functions. Without those values it returns a local run response, so frontend
development does not require AWS credentials.

The chat route currently uses the grounded local responder. The worker should
move Bedrock calls behind the Step Functions/Lambda boundary and return only
answers with evidence references. `KHOJ_BEDROCK_MODEL_ID` is reserved for that
integration; do not put AWS credentials in the browser.

## Credit and cost guardrails

Before provisioning anything, verify the exact AWS promotional-credit terms and
regional pricing in the account. Set budgets and alerts before enabling a live
workflow. Keep development resources in one region, use short-lived S3 objects,
cap Bedrock input/output tokens, limit OpenSearch indexed documents, and pause
scheduled re-search while testing. Avoid duplicating environments until the
first end-to-end path is measured.

The local fallback is intentional: it keeps UI work and automated tests from
spending credits, while the same request contract is used for AWS execution.
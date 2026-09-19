"""
Read-only API for the FoundReport table.

Exposes a paginated listing of frontend-safe FoundReport records so the KHOJ
Database page can eventually be backed by real data.

DynamoDB access pattern:
    Query the existing GSI `source-lastUpdatedAt-index`
        partition key: source          (S)
        sort key:      last_updated_at (S)
    Source is always populated by the scraper pipeline (normalize_record.py),
    so the partition key is guaranteed present. Listing is bounded per source;
    `source=ALL` fans out one bounded Query per source in a single page request.

Pagination:
    DynamoDB's LastEvaluatedKey is base64url-encoded into an opaque cursor and
    verified on the way back in. A fan-out cursor remembers the exclusive start
    key of every source being paged.

Response hygiene:
    - `embedding` (and every other field outside the allowlist) is never returned.
    - Decimals are converted to JSON-safe int/float.
    - Internal infrastructure details are never included in errors.

This handler intentionally supports READ only. It must never gain write paths.
"""

import base64
import binascii
import json
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

REGION = "ap-southeast-2"
TABLE = "FoundReport"
GSI_NAME = "source-lastUpdatedAt-index"
ALLOWED_ORIGIN = "https://updated-frontend.duo3mqhyrqgnv.amplifyapp.com"

# Mirrors the CORS pattern in create_missing_case.py.
# "user_submitted" covers records created via POST /found (the web form);
# without it, user reports would be invisible to the listing (verified live 2026-09-19).
SOURCES = ["ZIPNET", "user_submitted"]
DEFAULT_SOURCE = "ZIPNET"
DEFAULT_LIMIT = 25
MAX_LIMIT = 50

# Explicit allowlist of frontend-safe fields (matches the frontend MatchCandidate
# type in src/lib/khoj/api-types.ts). Anything not listed here — including the
# internal `embedding` field — is stripped before the response leaves the Lambda.
ALLOWED_FIELDS = frozenset(
    [
        "found_id",
        "name",
        "age_range",
        "gender",
        "height_cm",
        "location",
        "clothing",
        "description",
        "date_found",
        "police_station",
        "district",
        "state",
        "photo_urls",
        "source",
        "source_url",
    ]
)

_table = None


def get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb", region_name=REGION).Table(TABLE)
    return _table


def response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        "body": json.dumps(payload),
    }


def json_safe(value):
    """Recursively convert DynamoDB Decimals into JSON-safe int/float values."""
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, tuple):
        return [json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: json_safe(item) for key, item in value.items()}
    return value


def sanitize_item(item):
    """Return only the allowlisted frontend-safe fields; omit everything else."""
    return {key: json_safe(item[key]) for key in ALLOWED_FIELDS if key in item}


# ─── Cursor encoding ──────────────────────────────────────────────────────────

def encode_cursor(cursor_obj):
    raw = json.dumps(cursor_obj, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_cursor(cursor):
    try:
        padded = cursor + "=" * (-len(cursor) % 4)
        obj = json.loads(base64.urlsafe_b64decode(padded.encode("ascii")))
    except (ValueError, binascii.Error, UnicodeDecodeError):
        return None
    if not isinstance(obj, dict):
        return None
    # Single-source cursor: {"k": {"source": ..., "last_updated_at": ...}}
    # Fan-out cursor: {"ks": {source: key, ...}, "n": <page size>}
    if "k" in obj:
        key = obj["k"]
        if (
            isinstance(key, dict)
            and isinstance(key.get("source"), str)
            and isinstance(key.get("last_updated_at"), str)
        ):
            return obj
    if "ks" in obj and isinstance(obj.get("n"), int):
        keys = obj["ks"]
        if isinstance(keys, dict) and keys and all(
            isinstance(source, str)
            and isinstance(key, dict)
            and isinstance(key.get("source"), str)
            and isinstance(key.get("last_updated_at"), str)
            for source, key in keys.items()
        ):
            return obj
    return None


# ─── Request parsing ──────────────────────────────────────────────────────────

def parse_event(event):
    """Normalize API Gateway (REST/HTTP) and direct-invoke events."""
    if isinstance(event.get("body"), str):
        try:
            body = json.loads(event["body"])
        except ValueError:
            body = {}
    elif isinstance(event.get("body"), dict):
        body = event["body"]
    else:
        body = event

    params = body.get("queryStringParameters") or {}

    source = str(params.get("source") or DEFAULT_SOURCE).strip()
    if source == "ALL":
        source = "ALL"
    elif source not in SOURCES:
        source = DEFAULT_SOURCE

    try:
        limit = int(params.get("limit") or DEFAULT_LIMIT)
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    limit = max(1, min(MAX_LIMIT, limit))

    cursor = params.get("cursor")
    return source, limit, cursor


# ─── Listing ──────────────────────────────────────────────────────────────────

def query_source(source, limit, start_key):
    kwargs = {
        "IndexName": GSI_NAME,
        "KeyConditionExpression": Key("source").eq(source),
        "ScanIndexForward": False,  # newest records first
        "Limit": limit,
    }
    if start_key:
        kwargs["ExclusiveStartKey"] = start_key
    return get_table().query(**kwargs)


def list_items(source, limit, cursor):
    """Return (items, next_cursor). cursor is None when the listing is exhausted."""
    if source != "ALL":
        decoded = decode_cursor(cursor) if cursor else None
        if cursor and (decoded is None or "k" not in decoded):
            return None  # signals invalid cursor to the caller
        start_key = decoded["k"] if decoded else None
        result = query_source(source, limit, start_key)
        last_key = result.get("LastEvaluatedKey")
        return result.get("Items", []), (
            encode_cursor({"k": last_key}) if last_key else None
        )

    # source=ALL: bounded fan-out Query per source, honoring the shared limit.
    decoded = decode_cursor(cursor) if cursor else None
    if cursor and (decoded is None or "ks" not in decoded):
        return None  # signals invalid cursor to the caller
    resume = (decoded or {}).get("ks", {})
    page_size = (decoded or {}).get("n", limit)

    remaining = page_size
    items = []
    next_keys = {}
    for src in SOURCES:
        if remaining <= 0:
            # Preserve any stored key so later sources resume where they left off.
            if src in resume:
                next_keys[src] = resume[src]
            continue
        start_key = resume.get(src)
        try:
            result = query_source(src, remaining, start_key)
        except Exception:
            # A source with no index entries must not fail the whole listing.
            continue
        items.extend(result.get("Items", []))
        remaining -= len(result.get("Items", []))
        last_key = result.get("LastEvaluatedKey")
        if last_key:
            next_keys[src] = last_key
        elif src in resume:
            next_keys[src] = resume[src]

    next_cursor = encode_cursor({"ks": next_keys, "n": page_size}) if next_keys else None
    return items, next_cursor


# ─── Handler ──────────────────────────────────────────────────────────────────

def lambda_handler(event, context):
    try:
        source, limit, cursor = parse_event(event)

        listed = list_items(source, limit, cursor)
        if listed is None:
            return response(400, {"error": "Invalid cursor."})

        raw_items, next_cursor = listed
        return response(
            200,
            {
                "items": [sanitize_item(item) for item in raw_items],
                "next_cursor": next_cursor,
            },
        )
    except Exception as exc:
        # Response stays deliberately opaque (no table names, IAM, or infra detail).
        # Error detail goes to CloudWatch logs only, matching the existing handlers.
        print("GetFoundReports error:", repr(exc))
        return response(500, {"error": "Something went wrong. Please try again."})

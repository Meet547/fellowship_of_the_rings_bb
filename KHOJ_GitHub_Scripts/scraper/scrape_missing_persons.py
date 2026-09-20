"""Ingest the newest public ZIPNET missing-person records.

Raw evidence is retained in the private source bucket. Normalized records omit
complainant contact fields and are refreshed into the existing CPU index.
"""
import os
from datetime import datetime, timezone

from normalize_record import _to_int, _to_iso_date
from zipnet_common import BASE_URL, ZipnetScraper

REGION = os.getenv("AWS_DEFAULT_REGION", "ap-southeast-2")
BUCKET = os.getenv("ZIPNET_S3_BUCKET", "universe-test-1")
MAX_PAGES = int(os.getenv("ZIPNET_MISSING_MAX_PAGES", "10"))

ENDPOINT = f"{BASE_URL}/Victims/GetMissingPersonsData/"
COLUMNS = [
    {"data": "MissingPersonId", "name": "MissingPersonId", "searchable": "true", "orderable": "true"},
    {"data": "CreatedOn", "name": "CreatedOn", "searchable": "true", "orderable": "true"},
    {"data": "", "name": "", "searchable": "false", "orderable": "false"},
    {"data": "ImageUrls", "name": "", "searchable": "false", "orderable": "false"},
    {"data": "State", "name": "State", "searchable": "true", "orderable": "false"},
    {"data": "District", "name": "District", "searchable": "true", "orderable": "false"},
    {"data": "PoliceStation", "name": "Police Station", "searchable": "true", "orderable": "false"},
    {"data": "FIRNo", "name": "FIRNo", "searchable": "true", "orderable": "false"},
    {"data": "DD_Date", "name": "DD_Date", "searchable": "true", "orderable": "false"},
    {"data": "SerialNumber", "name": "SerialNumber", "searchable": "true", "orderable": "false"},
    {"data": "MissingFrom", "name": "MissingFrom", "searchable": "true", "orderable": "false"},
    {"data": "TracingStatus", "name": "TracingStatus", "searchable": "true", "orderable": "false"},
    {"data": "CreatedOn", "name": "CreatedOn", "searchable": "true", "orderable": "false"},
    {"data": "", "name": "", "searchable": "true", "orderable": "false"},
]


def normalize(raw):
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    birth_year = _to_int(raw.get("BirthYear"))
    age = datetime.now(timezone.utc).year - birth_year if birth_year and 1900 <= birth_year <= datetime.now(timezone.utc).year else None
    clothing = " ".join(str(v).strip() for v in (
        raw.get("DressUpperColor"), raw.get("DressUpper"),
        raw.get("DressLowerColor"), raw.get("DressLower"),
    ) if v and str(v).strip()) or None
    description = "; ".join(str(v).strip() for v in (
        raw.get("Description"), raw.get("PersonalDetails"),
        raw.get("PhysicalDetails"), raw.get("Build"),
        raw.get("Complexion"), raw.get("Hair"),
    ) if v and str(v).strip()) or None
    location = ", ".join(str(v).strip() for v in (
        raw.get("PoliceStation"), raw.get("District"), raw.get("State"),
    ) if v and str(v).strip()) or None
    tracing = str(raw.get("TracingStatus") or "").casefold()
    status = "official_closed" if any(word in tracing for word in ("traced", "found", "closed")) else "official"
    return {
        "case_id": f"ZIPNET-MISSING-{raw.get('MissingPersonId')}",
        "source": "ZIPNET",
        "source_type": "official",
        "source_name": "ZIPNET / Delhi Police",
        "source_url": f"{BASE_URL}/Victims/MissingPersons",
        "retrieved_at": stamp,
        "last_updated_at": stamp,
        "name": (raw.get("Name") or "").strip() or None,
        "age": age,
        "gender": raw.get("Sex"),
        "height_cm": _to_int(raw.get("Height")),
        "complexion": raw.get("Complexion"),
        "clothing": clothing,
        "distinctive_marks": raw.get("Tattoo") or raw.get("PhysicalDetails"),
        "last_seen_location": location,
        "last_seen_date": _to_iso_date(raw.get("MissingFrom") or raw.get("DD_Date")),
        "description": description,
        "photo_urls": [f"{BASE_URL}{url}" for url in (raw.get("ImageUrls") or [])],
        "state": raw.get("State"),
        "district": raw.get("District"),
        "police_station": raw.get("PoliceStation"),
        "status": status,
        "created_at": raw.get("CreatedOn") or stamp,
    }


def main():
    scraper = ZipnetScraper(
        name="missing_persons_recent",
        list_endpoint=ENDPOINT,
        referer_path="/Victims/MissingPersons",
        columns=COLUMNS,
        normalize_fn=normalize,
        dynamodb_table="MissingCase",
        s3_bucket=BUCKET,
        id_field="case_id",
    )
    # The portal is sorted newest first. Revisit a bounded recent window so
    # insertions do not get skipped when older results move between pages.
    scraper.load_checkpoint = lambda: {"start": 0, "records_saved": 0}
    scraper.save_checkpoint = lambda state: None
    scraper.run(max_pages=MAX_PAGES)


if __name__ == "__main__":
    main()

from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from service_common import refresh_records

from matchingfinal import MatchingEngine


TABLE = "MissingCase"
REGION = "ap-southeast-2"
MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CACHE = "/home/ssm-user/bharat-talaash/cache/missingcase_embedding_cache.npz"


class MissingMatchingEngine(MatchingEngine):
    @staticmethod
    def _record_id(record):
        return record.get("case_id")

    @staticmethod
    def adapt_candidate(record):
        r = dict(record)
        r["found_id"] = r.get("case_id")
        r["location"] = r.get("last_seen_location")
        r["date_found"] = r.get("last_seen_date")
        return r

    def _decode_records(self, raw):
        return super()._decode_records(
            [self.adapt_candidate(r) for r in raw]
        )

    def _validate_incoming_record(self, record):
        return super()._validate_incoming_record(
            self.adapt_candidate(record)
        )


class SearchRequest(BaseModel):
    query: Dict[str, Any]
    top_n: int = Field(default=5, ge=1, le=10)
    candidate_ids: list[str] | None = None


app = FastAPI(title="BharatTalaash MissingCase CPU Matcher")

engine = MissingMatchingEngine(
    TABLE,
    REGION,
    MODEL,
    64,
    CACHE,
)

engine.bootstrap()


def found_to_query(found: Dict[str, Any]) -> Dict[str, Any]:
    query = {
        "name": found.get("name"),
        "gender": found.get("gender"),
        "complexion": found.get("complexion"),
        "height_cm": found.get("height_cm"),
        "clothing": found.get("clothing"),
        "distinctive_marks": found.get("distinctive_marks"),
        "description": found.get("description"),
        "last_seen_location": found.get("location")
            or found.get("found_location")
            or found.get("last_seen_location"),
    }

    age = found.get("age")
    if age is not None:
        query["age"] = age
    else:
        amin = found.get("age_min")
        amax = found.get("age_max")
        if amin is not None and amax is not None:
            query["age"] = (float(amin) + float(amax)) / 2.0
        elif amin is not None:
            query["age"] = amin
        elif amax is not None:
            query["age"] = amax

    return {
        k: v
        for k, v in query.items()
        if v is not None and str(v).strip() != ""
    }


@app.get("/health")
def health():
    info = engine.get_health_info()
    info["direction"] = "found_to_missing"
    return info


@app.post("/search/missing")
def search_missing(req: SearchRequest):
    try:
        query = found_to_query(req.query)
        results = engine.search(query, top_n=req.top_n, candidate_ids=req.candidate_ids)

        clean = []
        for result in results:
            candidate = dict(result["candidate"])
            candidate.pop("embedding", None)

            clean.append({
                "case_id": candidate.get("case_id") or candidate.get("found_id"),
                "source": candidate.get("source"),
                "name": candidate.get("name"),
                "gender": candidate.get("gender"),
                "age": candidate.get("age"),
                "age_range": candidate.get("age_range"),
                "height_cm": candidate.get("height_cm"),
                "complexion": candidate.get("complexion"),
                "last_seen_location": candidate.get("last_seen_location")
                    or candidate.get("location"),
                "last_seen_date": candidate.get("last_seen_date")
                    or candidate.get("date_found"),
                "clothing": candidate.get("clothing"),
                "distinctive_marks": candidate.get("distinctive_marks"),
                "description": candidate.get("description"),
                "photo_urls": candidate.get("photo_urls"),
                "final_score": result.get("final_score"),
                "semantic_score": result.get("semantic_score"),
                "structured_score": result.get("structured_score"),
                "data_completeness": result.get("data_completeness"),
                "structured_details": result.get("structured_details"),
            })

        return {
            "query": query,
            "match_count": len(clean),
            "matches": clean,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

class RefreshRequest(BaseModel):
    ids: list[str]
    embed_missing: bool = False

@app.post('/refresh')
def refresh(req: RefreshRequest):
    return {'status': 'success', 'index_update': refresh_records(engine, 'MissingCase', 'case_id', req.ids, req.embed_missing)}

@app.post('/reconcile')
def reconcile():
    return {'status': 'success', 'index_update': engine.reconcile()}

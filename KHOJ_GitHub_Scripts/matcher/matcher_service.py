from typing import Any
from fastapi import FastAPI
from pydantic import BaseModel, Field
from matchingfinal import MatchingEngine, make_json_safe
from service_common import refresh_records

app = FastAPI(title='Bharat Talaash FoundReport matcher')
engine = MatchingEngine('FoundReport', 'ap-southeast-2', 'sentence-transformers/all-MiniLM-L6-v2', 64, '/home/ssm-user/bharat-talaash/cache/foundreport_embedding_cache.npz')
engine.bootstrap()

class SearchRequest(BaseModel):
    query: dict[str, Any]
    top_n: int = Field(default=5, ge=1, le=10)
    candidate_ids: list[str] | None = None

class RefreshRequest(BaseModel):
    ids: list[str] = []
    found_ids: list[str] = []  # Preserve dispatcher API.
    embed_missing: bool = False

@app.get('/health')
def health():
    return make_json_safe(engine.get_health_info())

@app.post('/search')
def search(req: SearchRequest):
    results = engine.search(req.query, top_n=req.top_n, candidate_ids=req.candidate_ids)
    for result in results:
        result['candidate'] = {k:v for k,v in result['candidate'].items() if k not in {'embedding','private_contact','contact','contact_number','email','phone','address','reporter_user_id'}}
    return {'status':'success', 'count':len(results), 'matches':make_json_safe(results)}

@app.post('/refresh')
def refresh(req: RefreshRequest):
    return {'status':'success', 'index_update': refresh_records(engine, 'FoundReport', 'found_id', req.ids or req.found_ids, req.embed_missing)}

@app.post('/reconcile')
def reconcile():
    return {'status': 'success', 'index_update': engine.reconcile()}

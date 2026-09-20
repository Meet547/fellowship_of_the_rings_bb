"""Small report refreshes use the same model on CPU; bulk GPU jobs are preserved."""
import threading
import boto3
from botocore.config import Config
from fastapi import HTTPException
from matchingfinal import build_query_text

resource = boto3.resource('dynamodb', region_name='ap-southeast-2', config=Config(retries={'mode': 'standard', 'max_attempts': 3}))
refresh_lock = threading.Lock()


def refresh_records(engine, table_name, key, ids, embed_missing=False):
    if len(ids) > 100:
        raise HTTPException(400, 'Maximum 100 IDs per refresh')
    records = []
    table = resource.Table(table_name)
    with refresh_lock:
        for rid in dict.fromkeys(ids):
            r = table.get_item(Key={key: rid}, ConsistentRead=True).get('Item')
            if not r:
                continue
            if not r.get('embedding') and embed_missing:
                # Keep existing embedded corpus/model untouched. Small user
                # submissions do not need an expensive GPU instance startup.
                query = dict(r)
                query['last_seen_location'] = r.get('last_seen_location', r.get('location'))
                vector = engine.embedder.encode([build_query_text(query)], batch_size=1)[0]
                r['embedding'] = vector.astype('float32').tobytes()
                r['embedding_model'] = 'sentence-transformers/all-MiniLM-L6-v2'
                table.update_item(Key={key: rid}, UpdateExpression='SET embedding = :e, embedding_model = :m', ExpressionAttributeValues={':e': r['embedding'], ':m': r['embedding_model']})
            if r.get('embedding'):
                records.append(r)
        return engine.add_or_update_records(records)

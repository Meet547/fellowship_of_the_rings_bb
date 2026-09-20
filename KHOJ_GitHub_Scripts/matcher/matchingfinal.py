import argparse
import json
import os
import threading
from dataclasses import dataclass, field, replace
from decimal import Decimal
from typing import Any, Dict, List, Optional, Sequence, Tuple
import boto3
import numpy as np
DEFAULT_TABLE = 'FoundReport'
DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION', 'ap-southeast-2')
DEFAULT_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
DEFAULT_CACHE = './foundreport_embedding_cache.npz'
DEFAULT_INGEST_BATCH = 2000

def make_aws_session(region):
    """boto3 resolves credentials from the EC2 instance's attached
    IAM role (BharatTalaash-GPU-Role) automatically."""
    return boto3.Session(region_name=region)

def detect_device():
    import torch
    if torch.cuda.is_available():
        print('GPU detected:')
        print(f'  Device : {torch.cuda.get_device_name(0)}')
        print(f'  CUDA   : {torch.version.cuda}')
        return 'cuda'
    print('CUDA not available. Using CPU.')
    return 'cpu'

def normalize_model_name(name):
    if not name:
        return ''
    name = str(name).strip().lower()
    for prefix in ('sentence-transformers/', 'sentence_transformers/'):
        if name.startswith(prefix):
            name = name[len(prefix):]
    return name

def models_are_compatible(a, b):
    return normalize_model_name(a) == normalize_model_name(b)

def decode_embedding(value):
    """
    DynamoDB sample: boto3.dynamodb.types.Binary, 1536 bytes
    1536 / 4 = 384 float32 dimensions.
    """
    if hasattr(value, 'value'):
        value = value.value
    if isinstance(value, bytearray):
        value = bytes(value)
    if isinstance(value, bytes):
        if len(value) % 4 != 0:
            raise ValueError(f'Embedding binary length {len(value)} is not divisible by 4.')
        return np.frombuffer(value, dtype='<f4').copy()
    if isinstance(value, (list, tuple)):
        return np.asarray([float(x) for x in value], dtype='float32')
    raise TypeError(f'Unsupported embedding type: {type(value)}')

def scan_table(table):
    """
    Full table Scan. Intentionally no ProjectionExpression (reserved
    keywords such as `location`/`source`; schema-robust).
    ONLY called from MatchingEngine.reconcile()/refresh_from_dynamodb().
    Never called from search() or add_or_update_records().
    """
    print('\nScanning DynamoDB...')
    records = []
    page = 0
    scan_kwargs = {}
    while True:
        page += 1
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        records.extend(items)
        print(f'  DynamoDB page {page}: {len(items)} records')
        last_key = response.get('LastEvaluatedKey')
        if not last_key:
            break
        scan_kwargs['ExclusiveStartKey'] = last_key
    print(f'\nTotal DynamoDB records: {len(records):,}')
    return records

def make_json_safe(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    if isinstance(obj, dict):
        return {str(k): make_json_safe(v) for k, v in obj.items() if k not in ('embedding', 'embedding_model')}
    if isinstance(obj, (list, tuple)):
        return [make_json_safe(x) for x in obj]
    if isinstance(obj, bytes):
        return '<binary>'
    return obj

def save_cache(path, records, embeddings, model_name):
    """Atomically persist the index so it survives an EC2 restart."""
    print('\nSaving embedding cache:')
    print(f'  {path}')
    safe_records = [make_json_safe(r) for r in records]
    tmp_path = path + '.tmp.npz'
    np.savez_compressed(tmp_path, embeddings=np.asarray(embeddings, dtype='float32'), records=np.array(json.dumps(safe_records, ensure_ascii=False), dtype=object), model=np.array(model_name, dtype=object))
    os.replace(tmp_path, path)
    print('Cache saved.')

def load_cache(path, requested_model):
    if not os.path.exists(path):
        return None
    print('\nLoading cached embeddings:')
    print(f'  {path}')
    try:
        data = np.load(path, allow_pickle=True)
        cached_model = str(data['model'].item())
        if not models_are_compatible(cached_model, requested_model):
            print('Cache model mismatch. Ignoring existing cache.')
            print(f'  Cache    : {cached_model}')
            print(f'  Requested: {requested_model}')
            return None
        embeddings = np.asarray(data['embeddings'], dtype='float32')
        records = json.loads(data['records'].item())
        if embeddings.ndim != 2:
            raise ValueError(f'Invalid cached shape: {embeddings.shape}')
        if len(records) != len(embeddings):
            raise ValueError('Cached records and embeddings count mismatch.')
        print(f'Cached records  : {len(records):,}')
        print(f'Embedding shape : {embeddings.shape}')
        print(f'Cached model    : {cached_model}')
        return (records, embeddings)
    except Exception as exc:
        print(f'Cache load failed: {exc}')
        return None

def build_query_text(case):
    parts = []
    fields = [('name', 'Name'), ('age', 'Age'), ('age_range', 'Age range'), ('gender', 'Gender'), ('complexion', 'Complexion'), ('height_cm', 'Height'), ('last_seen_location', 'Last seen location'), ('last_seen_date', 'Last seen date'), ('clothing', 'Clothing'), ('distinctive_marks', 'Distinctive marks'), ('description', 'Description')]
    for key, label in fields:
        value = case.get(key)
        if value is None:
            continue
        if str(value).strip() == '':
            continue
        parts.append(f'{label}: {value}')
    if not parts:
        parts.append(json.dumps(case, ensure_ascii=False))
    return '. '.join(parts)

class QueryEmbedder:

    def __init__(self, model_name, device):
        self.model_name = model_name
        self.device = device
        self.model = None

    def load(self):
        if self.model is not None:
            return self.model
        from sentence_transformers import SentenceTransformer
        print('\nLoading SentenceTransformer...')
        print(f'  Model : {self.model_name}')
        print(f'  Device: {self.device}')
        self.model = SentenceTransformer(self.model_name, device=self.device)
        return self.model

    def encode(self, texts, batch_size=64):
        model = self.load()
        embeddings = model.encode(texts, batch_size=batch_size, normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=False)
        return np.asarray(embeddings, dtype='float32')

def norm(value):
    if value is None:
        return ''
    return str(value).strip().lower()

def flatten_age(value):
    """
    Return one representative numeric age when possible.

    Supports:
      7
      "7"
      "7-8"
      "7 to 8"
      "Child (0-12)"
      "70+"
      [7, 8]

    Ranges are represented by their midpoint.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, (list, tuple)):
        nums = []
        for item in value:
            parsed = flatten_age(item)
            if parsed is not None:
                nums.append(parsed)
        if not nums:
            return None
        return sum(nums) / len(nums)
    text = str(value).strip().lower()
    if not text:
        return None
    text = text.replace('–', '-').replace('—', '-').replace(' to ', '-')
    nums = []
    current = ''
    for ch in text:
        if ch.isdigit() or ch == '.':
            current += ch
        elif current:
            try:
                nums.append(float(current))
            except ValueError:
                pass
            current = ''
    if current:
        try:
            nums.append(float(current))
        except ValueError:
            pass
    if not nums:
        return None
    if len(nums) >= 2:
        return (nums[0] + nums[1]) / 2.0
    return nums[0]

def text_tokens(value):
    if value is None:
        return set()
    text = norm(value)
    for ch in ',.;:/\\-_()[]{}':
        text = text.replace(ch, ' ')
    return {x for x in text.split() if len(x) > 1}

def token_overlap(a, b):
    a_words = text_tokens(a)
    b_words = text_tokens(b)
    if not a_words or not b_words:
        return 0.0
    return len(a_words & b_words) / len(a_words)

def text_similarity(a, b):
    a_words = text_tokens(a)
    b_words = text_tokens(b)
    if not a_words or not b_words:
        return 0.0
    union = len(a_words | b_words)
    if union == 0:
        return 0.0
    return len(a_words & b_words) / union

def passes_filters(query, candidate):
    """
    IMPORTANT:
    Do not hard-filter age because many ZIPNET records only contain
    age_range. Gender is the only hard filter when both sides
    explicitly provide it.
    """
    q_gender = norm(query.get('gender'))
    c_gender = norm(candidate.get('gender'))
    if q_gender and c_gender:
        if q_gender != c_gender:
            return False
    return True

def structured_match(query, candidate):
    """
    Returns score / comparable / matched / completeness.
    Missing candidate information is NEVER counted as a match.
    """
    weights = {'name': 30.0, 'gender': 15.0, 'age': 15.0, 'complexion': 10.0, 'height_cm': 10.0, 'clothing': 20.0, 'distinctive_marks': 25.0, 'location': 5.0}
    matched_weight = 0.0
    comparable_weight = 0.0
    query_available_weight = 0.0
    details = {}
    q_name = norm(query.get('name'))
    c_name = norm(candidate.get('name'))
    if q_name:
        query_available_weight += weights['name']
    if q_name and c_name:
        comparable_weight += weights['name']
        if q_name == c_name:
            matched_weight += weights['name']
            details['name'] = 'exact'
        elif q_name in c_name or c_name in q_name:
            matched_weight += weights['name'] * 0.85
            details['name'] = 'strong'
        else:
            similarity = text_similarity(q_name, c_name)
            if similarity >= 0.75:
                matched_weight += weights['name'] * 0.75
                details['name'] = 'strong'
            elif similarity >= 0.5:
                matched_weight += weights['name'] * 0.5
                details['name'] = 'partial'
            else:
                details['name'] = 'different'
    elif q_name:
        details['name'] = 'missing_candidate'
    q = norm(query.get('gender'))
    c = norm(candidate.get('gender'))
    if q:
        query_available_weight += weights['gender']
    if q and c:
        comparable_weight += weights['gender']
        if q == c:
            matched_weight += weights['gender']
            details['gender'] = 'match'
        else:
            details['gender'] = 'conflict'
    elif q:
        details['gender'] = 'missing_candidate'
    q_age = flatten_age(query.get('age'))
    c_age = flatten_age(candidate.get('age'))
    if c_age is None:
        c_age = flatten_age(candidate.get('age_range'))
    if q_age is not None:
        query_available_weight += weights['age']
    if q_age is not None and c_age is not None:
        comparable_weight += weights['age']
        diff = abs(q_age - c_age)
        if diff == 0:
            matched_weight += weights['age']
            details['age'] = 'exact'
        elif diff <= 2:
            matched_weight += weights['age'] * 0.8
            details['age'] = f'close ({diff:g} years)'
        elif diff <= 5:
            matched_weight += weights['age'] * 0.5
            details['age'] = f'moderate ({diff:g} years)'
        elif diff <= 8:
            matched_weight += weights['age'] * 0.2
            details['age'] = f'weak ({diff:g} years)'
        else:
            details['age'] = f'far ({diff:g} years)'
    elif q_age is not None:
        details['age'] = 'missing_candidate'
    q = norm(query.get('complexion'))
    c = norm(candidate.get('complexion'))
    if q:
        query_available_weight += weights['complexion']
    if q and c:
        comparable_weight += weights['complexion']
        if q in c or c in q:
            matched_weight += weights['complexion']
            details['complexion'] = 'match'
        else:
            details['complexion'] = 'different'
    elif q:
        details['complexion'] = 'missing_candidate'
    q_height = flatten_age(query.get('height_cm'))
    c_height = flatten_age(candidate.get('height_cm'))
    if q_height is not None:
        query_available_weight += weights['height_cm']
    if q_height is not None and c_height is not None:
        comparable_weight += weights['height_cm']
        diff = abs(q_height - c_height)
        if diff <= 2:
            matched_weight += weights['height_cm']
            details['height_cm'] = 'very close'
        elif diff <= 5:
            matched_weight += weights['height_cm'] * 0.7
            details['height_cm'] = 'close'
        elif diff <= 10:
            matched_weight += weights['height_cm'] * 0.35
            details['height_cm'] = 'moderate'
        else:
            details['height_cm'] = 'different'
    elif q_height is not None:
        details['height_cm'] = 'missing_candidate'
    q = query.get('clothing')
    c = candidate.get('clothing')
    if q:
        query_available_weight += weights['clothing']
    if q and c:
        comparable_weight += weights['clothing']
        overlap = token_overlap(q, c)
        if overlap >= 0.6:
            matched_weight += weights['clothing']
            details['clothing'] = 'strong'
        elif overlap >= 0.3:
            matched_weight += weights['clothing'] * 0.65
            details['clothing'] = 'partial'
        elif overlap > 0:
            matched_weight += weights['clothing'] * 0.25
            details['clothing'] = 'weak'
        else:
            details['clothing'] = 'no token overlap'
    elif q:
        details['clothing'] = 'missing_candidate'
    q = query.get('distinctive_marks')
    c = candidate.get('distinctive_marks')
    if q:
        query_available_weight += weights['distinctive_marks']
    if q and c:
        comparable_weight += weights['distinctive_marks']
        overlap = token_overlap(q, c)
        if overlap >= 0.6:
            matched_weight += weights['distinctive_marks']
            details['distinctive_marks'] = 'strong'
        elif overlap >= 0.3:
            matched_weight += weights['distinctive_marks'] * 0.65
            details['distinctive_marks'] = 'partial'
        elif overlap > 0:
            matched_weight += weights['distinctive_marks'] * 0.25
            details['distinctive_marks'] = 'weak'
        else:
            details['distinctive_marks'] = 'no token overlap'
    elif q:
        details['distinctive_marks'] = 'missing_candidate'
    q = query.get('last_seen_location')
    c = candidate.get('location')
    if q:
        query_available_weight += weights['location']
    if q and c:
        comparable_weight += weights['location']
        q_tokens = text_tokens(q)
        c_tokens = text_tokens(c)
        if q_tokens and c_tokens:
            overlap = len(q_tokens & c_tokens) / len(q_tokens)
            if overlap >= 0.5:
                matched_weight += weights['location']
                details['location'] = 'strong'
            elif overlap > 0:
                matched_weight += weights['location'] * 0.5
                details['location'] = 'partial'
            else:
                details['location'] = 'different'
        else:
            details['location'] = 'unusable'
    elif q:
        details['location'] = 'missing_candidate'
    score = matched_weight / comparable_weight * 100.0 if comparable_weight > 0 else 0.0
    completeness = comparable_weight / query_available_weight * 100.0 if query_available_weight > 0 else 0.0
    return {'score': round(score, 2), 'comparable_weight': round(comparable_weight, 2), 'query_available_weight': round(query_available_weight, 2), 'completeness': round(completeness, 2), 'details': details}

@dataclass(frozen=True)
class IndexSnapshot:
    """
    Immutable, mutually consistent (records, CPU matrix, GPU matrix,
    positions) quadruple. search() grabs a reference under a short
    lock and reads ONLY this object; index updates publish a brand-new
    snapshot instead of mutating fields in place, so a concurrent
    search can never observe a half-updated index.
    """
    records: Tuple[dict, ...] = ()
    cpu_matrix: Optional[np.ndarray] = None
    gpu_matrix: Any = None
    positions: Dict[Any, int] = field(default_factory=dict)
    generation: int = 0
    dimension: Optional[int] = None

def chunked(seq, size):
    """Yield successive batches of at most `size` items."""
    for i in range(0, len(seq), size):
        yield seq[i:i + size]

class MatchingEngine:
    """
    Production matching engine (v2).

    Public interface:
        bootstrap()                        cache-first startup load
        load_index()                       alias of bootstrap()
        add_or_update_records(records)     incremental batch add/update
        reconcile() / refresh_from_dynamodb()  manual full refresh
        get_health_info()                  health/observability

    Index model:
        The index is an immutable IndexSnapshot. Every mutation
        (bootstrap, reconcile, incremental batch) decodes/validates
        the incoming batch, builds a new snapshot, publishes it under
        a single lock acquisition, and persists it to the npz cache.

    GPU updates:
        Pure-append batches extend the existing GPU tensor with
        torch.cat (no full re-upload). Batches containing in-place
        updates, or any full rebuild, re-upload the matrix once.

    Thread safety:
        threading.RLock guards snapshot publication only. search()
        holds the lock just long enough to copy the snapshot reference.
    """

    def __init__(self, table_name, region, model_name, batch_size, cache_path, refresh_cache=False):
        self.table_name = table_name
        self.region = region
        self.model_name = model_name
        self.batch_size = batch_size
        self.cache_path = cache_path
        self.refresh_cache = refresh_cache
        self.device = detect_device()
        self.session = make_aws_session(region)
        self.table = self.session.resource('dynamodb').Table(table_name)
        self._index = IndexSnapshot()
        self._lock = threading.RLock()
        self.embedder = QueryEmbedder(model_name, self.device)

    @property
    def records(self):
        return list(self._index.records)

    @property
    def embeddings_cpu(self):
        return self._index.cpu_matrix

    @property
    def embeddings_gpu(self):
        return self._index.gpu_matrix

    @property
    def record_positions(self):
        return dict(self._index.positions)

    @property
    def index_generation(self):
        return self._index.generation

    @property
    def dimension(self):
        return self._index.dimension

    @staticmethod
    def _record_id(record):
        return record.get('found_id')

    @staticmethod
    def _normalize_matrix(matrix):
        matrix = np.asarray(matrix, dtype='float32')
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        return matrix / np.maximum(norms, 1e-12)

    @staticmethod
    def _normalize_vector(vector):
        vector = np.asarray(vector, dtype='float32')
        n = float(np.linalg.norm(vector))
        return vector / max(n, 1e-12)

    @staticmethod
    def _build_positions(records):
        positions = {}
        for i, record in enumerate(records):
            found_id = MatchingEngine._record_id(record)
            if found_id is not None:
                positions[found_id] = i
        return positions

    def _upload_gpu_matrix(self, cpu_matrix):
        """Create a fresh GPU tensor from a CPU matrix (or None)."""
        if self.device != 'cuda':
            return None
        import torch
        if cpu_matrix is None or len(cpu_matrix) == 0:
            return None
        return torch.from_numpy(cpu_matrix).to('cuda', non_blocking=True)

    def _install_snapshot(self, records, cpu_matrix, gpu_matrix, dimension):
        """Publish a brand-new snapshot (never mutate in place)."""
        records_tuple = tuple((dict(r) for r in records))
        positions = self._build_positions(records_tuple)
        self._index = IndexSnapshot(records=records_tuple, cpu_matrix=cpu_matrix, gpu_matrix=gpu_matrix, positions=positions, generation=self._index.generation + 1, dimension=dimension)

    def _decode_records(self, raw):
        """
        Decode raw DynamoDB items into (records, vectors) with the
        shared model/dimension validation. Used by reconcile() only.
        """
        records = []
        vectors = []
        skipped_no_embedding = 0
        skipped_bad_embedding = 0
        skipped_wrong_model = 0
        observed_models = {}
        for record in raw:
            embedding = record.get('embedding')
            if embedding is None:
                skipped_no_embedding += 1
                continue
            stored_model = record.get('embedding_model')
            model_key = str(stored_model) if stored_model else '<missing>'
            observed_models[model_key] = observed_models.get(model_key, 0) + 1
            if stored_model and (not models_are_compatible(stored_model, self.model_name)):
                skipped_wrong_model += 1
                continue
            try:
                vector = decode_embedding(embedding)
            except Exception:
                skipped_bad_embedding += 1
                continue
            records.append(record)
            vectors.append(vector)
        stats = {'skipped_no_embedding': skipped_no_embedding, 'skipped_bad_embedding': skipped_bad_embedding, 'skipped_wrong_model': skipped_wrong_model, 'observed_models': observed_models}
        return (records, vectors, stats)

    def _validate_incoming_record(self, record):
        """
        Validate a single record that is expected to ALREADY contain a
        pre-computed embedding. Returns (record_copy, vector) or None.
        Never generates embeddings.
        """
        found_id = self._record_id(record)
        if found_id is None:
            return None
        embedding = record.get('embedding')
        if embedding is None:
            return None
        stored_model = record.get('embedding_model')
        if stored_model and (not models_are_compatible(stored_model, self.model_name)):
            return None
        try:
            vector = decode_embedding(embedding)
        except Exception:
            return None
        if self.dimension is not None and len(vector) != self.dimension:
            return None
        return (dict(record), self._normalize_vector(vector))

    def _persist_cache(self):
        """Write the current snapshot to the durable npz cache."""
        snap = self._index
        if snap.cpu_matrix is None or len(snap.records) == 0:
            return
        save_cache(self.cache_path, list(snap.records), snap.cpu_matrix, self.model_name)

    def bootstrap(self):
        """
        Startup path:
            cache exists + valid  -> load cache, build GPU matrix, ready
            otherwise             -> reconcile() (full Scan, then cache)

        Never regenerates embeddings from raw text.
        """
        if not self.refresh_cache:
            cached = load_cache(self.cache_path, self.model_name)
            if cached is not None:
                records, embeddings = cached
                matrix = self._normalize_matrix(embeddings)
                dimension = matrix.shape[1] if matrix.ndim == 2 else None
                with self._lock:
                    gpu_matrix = self._upload_gpu_matrix(matrix)
                    self._install_snapshot(records, matrix, gpu_matrix, dimension)
                print(f'\nUsing cached index: {len(self._index.records):,} records')
                print(f'Embedding dimension: {self._index.dimension}')
                return
        self.reconcile()

    def load_index(self):
        return self.bootstrap()

    def add_or_update_records(self, records, ingest_batch_size=DEFAULT_INGEST_BATCH):
        """
        Add or update candidate records that ALREADY contain valid
        pre-computed embeddings (same shape as a DynamoDB item:
        at least 'found_id', 'embedding', 'embedding_model').

        - Input is processed in batches of `ingest_batch_size` records.
        - found_id already indexed -> update that row
        - found_id new             -> append new rows
        - One atomic snapshot commit for the whole call; GPU tensor is
          extended with torch.cat for pure appends (no full re-upload),
          or rebuilt once when updates are present.
        - Does NOT touch DynamoDB; callers write records there first.
        - The npz cache is re-persisted atomically after the commit.

        Returns {"added", "updated", "skipped", "batches"}.
        """
        if not records:
            return {'added': 0, 'updated': 0, 'skipped': 0, 'batches': 0}
        if not isinstance(records, (list, tuple)):
            records = list(records)
        records = list({self._record_id(r): r for r in records if self._record_id(r)}.values())
        added = 0
        updated = 0
        skipped = 0
        batches = 0
        with self._lock:
            staged_updates = []
            staged_adds = []
            positions = self._index.positions
            pending_positions = dict(positions)
            for batch in chunked(records, ingest_batch_size):
                batches += 1
                for record in batch:
                    result = self._validate_incoming_record(record)
                    if result is None:
                        skipped += 1
                        continue
                    record_copy, vector = result
                    found_id = self._record_id(record_copy)
                    if found_id in pending_positions:
                        staged_updates.append((pending_positions[found_id], record_copy, vector))
                    else:
                        pending_positions[found_id] = len(self._index.records) + len(staged_adds)
                        staged_adds.append((record_copy, vector))
            if not staged_updates and (not staged_adds):
                print(f'\nadd_or_update_records: nothing usable (skipped={skipped})')
                return {'added': 0, 'updated': 0, 'skipped': skipped, 'batches': batches}
            snap = self._index
            old_cpu = snap.cpu_matrix
            if staged_updates:
                new_cpu = old_cpu.copy() if old_cpu is not None else None
                for row_index, _, vector in staged_updates:
                    new_cpu[row_index] = vector
            else:
                new_cpu = old_cpu
            append_matrix = None
            if staged_adds:
                append_matrix = np.vstack([v for _, v in staged_adds]).astype('float32')
                new_cpu = np.concatenate([new_cpu, append_matrix], axis=0) if new_cpu is not None else append_matrix
            new_records = list(snap.records)
            for row_index, record_copy, _ in staged_updates:
                new_records[row_index] = record_copy
            for record_copy, _ in staged_adds:
                new_records.append(record_copy)
            dimension = snap.dimension
            if dimension is None and new_cpu is not None:
                dimension = new_cpu.shape[1]
            if self.device == 'cuda':
                if staged_updates or snap.gpu_matrix is None:
                    gpu_matrix = self._upload_gpu_matrix(new_cpu)
                else:
                    import torch
                    new_rows_gpu = torch.from_numpy(append_matrix).to('cuda', non_blocking=True)
                    gpu_matrix = torch.cat([snap.gpu_matrix, new_rows_gpu], dim=0)
            else:
                gpu_matrix = None
            self._install_snapshot(new_records, new_cpu, gpu_matrix, dimension)
            updated = len(staged_updates)
            added = len(staged_adds)
            self._persist_cache()
            print(f'\nadd_or_update_records: added={added} updated={updated} skipped={skipped} batches={batches}')
            print(f'Index generation: {self._index.generation}  total records: {len(self._index.records):,}')
            return {'added': added, 'updated': updated, 'skipped': skipped, 'batches': batches}

    def reconcile(self):
        """
        Full DynamoDB Scan + full index rebuild + cache re-persist.

        ONLY for:
          - startup recovery (no valid cache)
          - --refresh-cache
          - manual/operational reconciliation

        Must NEVER be called from search() or per-request paths,
        and never per ingestion batch.
        """
        raw = scan_table(self.table)
        records, vectors, stats = self._decode_records(raw)
        print('\nEmbedding models found in DynamoDB:')
        for model, count in sorted(stats['observed_models'].items(), key=lambda x: -x[1]):
            print(f'  {model}: {count:,}')
        if not vectors:
            raise RuntimeError('\nNo usable embeddings found.\nThe DynamoDB embedding field exists, but the records could not be decoded or the stored embedding model did not match.')
        dimension = len(vectors[0])
        bad_dimensions = sum((len(v) != dimension for v in vectors))
        if bad_dimensions:
            raise RuntimeError(f'DynamoDB contains {bad_dimensions} embeddings with inconsistent dimensions.')
        matrix = self._normalize_matrix(np.vstack(vectors).astype('float32'))
        with self._lock:
            gpu_matrix = self._upload_gpu_matrix(matrix)
            self._install_snapshot(records, matrix, gpu_matrix, dimension)
            print(f'\nLoaded indexed records : {len(self._index.records):,}')
            print(f"Skipped no embedding   : {stats['skipped_no_embedding']:,}")
            print(f"Skipped wrong model    : {stats['skipped_wrong_model']:,}")
            print(f"Skipped bad embedding  : {stats['skipped_bad_embedding']:,}")
            print(f'Embedding dimension    : {self._index.dimension}')
            print(f'RAM for embeddings     : {self._index.cpu_matrix.nbytes / 1024 ** 2:.2f} MB')
            self._persist_cache()

    def refresh_from_dynamodb(self):
        return self.reconcile()

    def create_query_embedding(self, case):
        query_text = build_query_text(case)
        vector = self.embedder.encode([query_text], batch_size=self.batch_size)[0]
        if len(vector) != self.dimension:
            raise RuntimeError(f'\nDimension mismatch:\n  Query embedding : {len(vector)}\n  DB embedding    : {self.dimension}\n\nMake sure the query model is the same model used to create DynamoDB embeddings.')
        return vector

    def similarity(self, query_vector, gpu_matrix, cpu_matrix):
        """
        Score query_vector against an already-snapshotted matrix.
        Never transfers the full embedding matrix here — uploads only
        happen at index-build time.
        """
        if self.device == 'cuda' and gpu_matrix is not None:
            import torch
            query_tensor = torch.from_numpy(query_vector).to('cuda', non_blocking=True)
            with torch.inference_mode():
                scores = gpu_matrix @ query_tensor
            result = scores.detach().cpu().numpy()
            del query_tensor
            del scores
            return result
        return cpu_matrix @ query_vector

    def search(self, case, top_n=10, candidate_ids=None):
        with self._lock:
            snap = self._index
        records = snap.records
        record_count = len(records)
        if record_count == 0 or snap.cpu_matrix is None:
            print('\nIndex is empty.')
            return []
        allowed_ids = set(candidate_ids) if candidate_ids is not None else None
        allowed = [i for i in range(record_count) if passes_filters(case, records[i]) and (allowed_ids is None or self._record_id(records[i]) in allowed_ids)]
        if not allowed:
            print('\nNo candidates passed the structured filters.')
            return []
        query_vector = self.create_query_embedding(case)
        all_scores = self.similarity(query_vector, snap.gpu_matrix, snap.cpu_matrix)
        results = []
        for index in allowed:
            candidate = records[index]
            cosine = float(all_scores[index])
            semantic_score = max(0.0, min(100.0, (cosine + 1.0) / 2.0 * 100.0))
            structured = structured_match(case, candidate)
            structured_score = structured['score']
            completeness = structured['completeness']
            evidence_factor = min(1.0, completeness / 100.0)
            effective_structured = structured_score * evidence_factor
            final_score = 0.8 * semantic_score + 0.2 * effective_structured
            results.append({'candidate': candidate, 'semantic_similarity': round(cosine, 4), 'semantic_score': round(semantic_score, 2), 'structured_score': round(structured_score, 2), 'effective_structured_score': round(effective_structured, 2), 'data_completeness': round(completeness, 2), 'final_score': round(final_score, 2), 'structured_details': structured['details']})
        results.sort(key=lambda x: x['final_score'], reverse=True)
        return results[:top_n]

    def get_health_info(self):
        """
        Lightweight, non-sensitive index/runtime status — safe for a
        health-check endpoint. Never includes credentials.
        """
        import torch
        with self._lock:
            snap = self._index
        cpu_bytes = snap.cpu_matrix.nbytes if snap.cpu_matrix is not None else 0
        gpu_bytes = 0
        if snap.gpu_matrix is not None:
            gpu_bytes = snap.gpu_matrix.element_size() * snap.gpu_matrix.nelement()
        return {'record_count': len(snap.records), 'embedding_dimension': snap.dimension, 'cpu_matrix_mb': round(cpu_bytes / 1024 ** 2, 2), 'gpu_matrix_mb': round(gpu_bytes / 1024 ** 2, 2), 'index_generation': snap.generation, 'cuda_available': torch.cuda.is_available(), 'device': self.device, 'model_name': self.model_name, 'table_name': self.table_name, 'region': self.region}

def print_results(results):
    print('\n' + '=' * 72)
    print(f'TOP {len(results)} MATCHES')
    print('=' * 72)
    if not results:
        print('\nNo matching candidates found.')
        return
    for rank, result in enumerate(results, start=1):
        candidate = result['candidate']
        print(f'\n#{rank}')
        print('-' * 72)
        print(f"Found ID          : {candidate.get('found_id')}")
        print(f"Name              : {candidate.get('name')}")
        print(f"Age               : {candidate.get('age')}")
        print(f"Age range         : {candidate.get('age_range')}")
        print(f"Gender            : {candidate.get('gender')}")
        print(f"Complexion        : {candidate.get('complexion')}")
        print(f"Height            : {candidate.get('height_cm')}")
        print(f"Location          : {candidate.get('location')}")
        print(f"Date found        : {candidate.get('date_found')}")
        print(f"Clothing          : {candidate.get('clothing')}")
        print(f"Distinctive marks : {candidate.get('distinctive_marks')}")
        print(f"Description       : {candidate.get('description')}")
        print(f"Police station    : {candidate.get('police_station')}")
        print(f"District          : {candidate.get('district')}")
        print('\nScores:')
        print(f"  Semantic similarity     : {result['semantic_similarity']}")
        print(f"  Semantic score          : {result['semantic_score']}/100")
        print(f"  Structured match        : {result['structured_score']}/100")
        print(f"  Effective structured    : {result['effective_structured_score']}/100")
        print(f"  Data completeness       : {result['data_completeness']}%")
        print(f"  FINAL RETRIEVAL SCORE   : {result['final_score']}/100")
        details = result.get('structured_details', {})
        if details:
            print('\nStructured evidence:')
            for fld, status in details.items():
                print(f'  {fld:20s}: {status}')

def main():
    parser = argparse.ArgumentParser(description='Bharat Talaash production GPU matching engine')
    parser.add_argument('--case-file', required=True, help='JSON file with the input case')
    parser.add_argument('--table', default=DEFAULT_TABLE)
    parser.add_argument('--region', default=DEFAULT_REGION)
    parser.add_argument('--model', default=DEFAULT_MODEL, help='SentenceTransformer model for the query. Must match DynamoDB embeddings.')
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--top', type=int, default=10)
    parser.add_argument('--cache', default=DEFAULT_CACHE)
    parser.add_argument('--refresh-cache', action='store_true', help='Ignore local cache and read embeddings from DynamoDB again.')
    parser.add_argument('--reconcile', action='store_true', help='Force a full DynamoDB Scan + rebuild before searching.')
    args = parser.parse_args()
    print('=' * 72)
    print('BHARAT TALAASH - PRODUCTION GPU MATCHING ENGINE')
    print('=' * 72)
    print(f'\nDynamoDB table : {args.table}')
    print(f'AWS region     : {args.region}')
    print(f'Embedding model: {args.model}')
    print(f'Batch size     : {args.batch_size}')
    with open(args.case_file, 'r', encoding='utf-8') as f:
        case = json.load(f)
    print('\nInput case:')
    print(json.dumps(case, indent=2, ensure_ascii=False))
    engine = MatchingEngine(table_name=args.table, region=args.region, model_name=args.model, batch_size=args.batch_size, cache_path=args.cache, refresh_cache=args.refresh_cache or args.reconcile)
    engine.bootstrap()
    health = engine.get_health_info()
    print('\n' + '=' * 72)
    print('INDEX HEALTH')
    print('=' * 72)
    for key, value in health.items():
        print(f'  {key:20s}: {value}')
    print('\n' + '=' * 72)
    print('SEARCHING')
    print('=' * 72)
    results = engine.search(case, top_n=args.top)
    print_results(results)
if __name__ == '__main__':
    main()

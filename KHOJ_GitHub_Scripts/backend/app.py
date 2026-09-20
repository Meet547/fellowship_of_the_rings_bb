"""Shared Lambda API/worker using existing tables, matcher and Cognito login."""
import base64
import hashlib
import json
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.config import Config
from botocore.exceptions import ClientError
from domain import FIELDS, can_share, case_status, fingerprint, public_report, redact, strong_candidate, validate_report

REGION = os.environ.get('AWS_REGION', 'ap-southeast-2')
CONFIG = Config(retries={'mode': 'standard', 'max_attempts': 3}, connect_timeout=3, read_timeout=15)
ddb = boto3.resource('dynamodb', region_name=REGION, config=CONFIG)
users, missing, found, matches = [ddb.Table(n) for n in ('User', 'MissingCase', 'FoundReport', 'Match')]
cognito = boto3.client('cognito-idp', region_name=REGION, config=CONFIG)
ssm = boto3.client('ssm', region_name=REGION, config=CONFIG)
lamb = boto3.client('lambda', region_name=REGION, config=CONFIG)
ses = boto3.client('sesv2', region_name=REGION, config=CONFIG)
s3 = boto3.client('s3', region_name=REGION, config=CONFIG)
POOL = os.environ.get('COGNITO_POOL_ID', 'ap-southeast-2_ZUNQA07nU')
CLIENT = os.environ.get('COGNITO_CLIENT_ID', '66u4omk97m9kv9j2p69hsuobnu')
WORKER = os.environ.get('WORKER_FUNCTION', 'BharatTalaash-MonitorCases')
INSTANCE = os.environ.get('MATCHER_INSTANCE_ID', 'i-0506afa068b36435c')
BUCKET = os.environ.get('UPLOAD_BUCKET', 'universe-test-1')
ORIGIN = os.environ.get('FRONTEND_URL', 'https://updated-frontend.duo3mqhyrqgnv.amplifyapp.com')
FREE_RUNS = 7


def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def later(days=2):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat(timespec='seconds')


def native(value):
    return json.loads(json.dumps(value, default=lambda v: float(v) if isinstance(v, Decimal) else str(v)), parse_float=Decimal)


def response(code, data):
    return {'statusCode': code, 'headers': {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'}, 'body': json.dumps(data, default=lambda v: float(v) if isinstance(v, Decimal) else str(v))}


def authenticate(event):
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('authorization', '').removeprefix('Bearer ')
    if not token or len(token) > 12000:
        raise PermissionError('Sign in required')
    try:
        # Cognito validates signature/revocation; then restrict the validated token
        # to this application's issuer/client (including cross-project Cognito).
        account = cognito.get_user(AccessToken=token)
        claims = json.loads(base64.urlsafe_b64decode(token.split('.')[1] + '==='))
        attrs = {a['Name']: a['Value'] for a in account['UserAttributes']}
        if claims.get('iss') != f'https://cognito-idp.{REGION}.amazonaws.com/{POOL}' or claims.get('client_id') != CLIENT or claims.get('token_use') != 'access' or claims.get('sub') != attrs.get('sub') or attrs.get('email_verified') != 'true':
            raise ValueError()
    except Exception:
        raise PermissionError('Sign in with a verified email')
    uid = attrs['sub']
    users.update_item(Key={'user_id': uid}, UpdateExpression='SET email = :e, updated_at = :t', ExpressionAttributeValues={':e': attrs['email'], ':t': now()})
    return uid


def rate_limit(uid):
    try:
        users.update_item(Key={'user_id': f'RATE#{uid}#{int(time.time()) // 60}'}, UpdateExpression='SET expires_at = :ttl ADD requests :one', ConditionExpression=Attr('requests').not_exists() | Attr('requests').lt(30), ExpressionAttributeValues={':one': 1, ':ttl': int(time.time()) + 3600})
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise OverflowError('Please wait before making more requests')
        raise


def query_all(table, **kwargs):
    paginator = ddb.meta.client.get_paginator('query')
    return [item for page in paginator.paginate(TableName=table.name, **kwargs) for item in page.get('Items', [])]


def own(table, key, uid):
    item = table.get_item(Key=key, ConsistentRead=True).get('Item')
    if not item or item.get('reporter_user_id') != uid:
        raise PermissionError('Report not available')
    return item


def enqueue(payload):
    lamb.invoke(FunctionName=WORKER, InvocationType='Event', Payload=json.dumps(payload).encode())


def audit(case_id, found_id, actor, action):
    matches.put_item(Item={'match_id': 'AUDIT#' + str(uuid.uuid4()), 'record_type': 'audit', 'case_id': case_id or '-', 'found_id': found_id or '-', 'actor': actor, 'action': action, 'created_at': now()})


def create_report(uid, kind, body):
    report = validate_report(body, kind)
    rid = fingerprint(uid, kind, report)
    table, key = (missing, 'case_id') if kind == 'missing' else (found, 'found_id')
    stamp = now()
    item = {**report, key: rid, 'reporter_user_id': uid, 'source': 'USER', 'source_type': 'user', 'source_name': 'Bharat Talaash', 'created_at': stamp, 'last_updated_at': stamp, 'status': 'active', 'search_status': 'pending', 'searches_performed': 0}
    contact = str(body.get('contact', body.get('contact_number', ''))).strip()
    if len(contact) > 120:
        raise ValueError('Contact too long')
    item['private_contact'] = contact
    if kind == 'missing':
        item.update(next_check_at=later(), last_checked_at=stamp, monitoring_runs=0, monitoring_limit=FREE_RUNS, monitoring_status='active')
    duplicate = False
    try:
        table.put_item(Item=item, ConditionExpression=Attr(key).not_exists())
    except ClientError as exc:
        if exc.response['Error']['Code'] != 'ConditionalCheckFailedException':
            raise
        duplicate = True
        item = own(table, {key: rid}, uid)
    if not duplicate or item.get('search_status') == 'failed':
        enqueue({'task': 'report', 'kind': kind, 'id': rid})
        audit(rid if kind == 'missing' else None, rid if kind == 'found' else None, uid, 'report_created')
    return {key: rid, 'duplicate': duplicate, 'status': item['status'], 'search_status': item['search_status'], 'matches': [], 'message': 'Saved. Results will appear on your dashboard.'}


def matcher(port, path, payload):
    # SSM transport keeps model endpoints private and avoids public-IP drift.
    encoded = base64.b64encode(json.dumps(payload, default=float).encode()).decode()
    command = f"printf %s {encoded} | base64 -d | curl --fail --silent --show-error --max-time 80 -H 'Content-Type: application/json' --data-binary @- http://127.0.0.1:{port}{path}"
    cid = ssm.send_command(InstanceIds=[INSTANCE], DocumentName='AWS-RunShellScript', Parameters={'commands': [command], 'executionTimeout': ['90']})['Command']['CommandId']
    for _ in range(90):
        time.sleep(1)
        try:
            result = ssm.get_command_invocation(CommandId=cid, InstanceId=INSTANCE)
        except ssm.exceptions.InvocationDoesNotExist:
            continue
        if result['Status'] == 'Success':
            return json.loads(result['StandardOutputContent'])
        if result['Status'] in {'Failed', 'Cancelled', 'TimedOut'}:
            raise RuntimeError('Matcher unavailable')
    raise TimeoutError('Matcher timed out')


def save_matches(case, report, score):
    mid = hashlib.sha256(f"{case['case_id']}:{report['found_id']}".encode()).hexdigest()
    item = {'match_id': mid, 'record_type': 'candidate', 'case_id': case['case_id'], 'found_id': report['found_id'], 'missing_owner': case.get('reporter_user_id', ''), 'found_owner': report.get('reporter_user_id', ''), 'missing_consent': 'pending', 'found_consent': 'pending', 'created_at': now(), 'status': 'potential', 'score': native({k: score[k] for k in ('final_score', 'semantic_score', 'structured_score', 'data_completeness', 'structured_details') if k in score}), 'missing_summary': public_report(case), 'found_summary': public_report(report), 'strong': strong_candidate(score)}
    # Avoid notifying yourself, and exclude closed/stopped cases.
    if case.get('status', '').lower() not in {'active', 'matched'} or item['missing_owner'] and item['missing_owner'] == item['found_owner']:
        return
    try:
        matches.put_item(Item=item, ConditionExpression=Attr('match_id').not_exists())
    except ClientError as exc:
        if exc.response['Error']['Code'] != 'ConditionalCheckFailedException':
            raise
        return
    audit(case['case_id'], report['found_id'], 'system', 'potential_match_created')
    if item['strong']:
        notify(item)


def notify(match):
    sender = os.environ.get('EMAIL_FROM')
    if not sender:
        return
    for side in ('missing', 'found'):
        uid = match.get(side + '_owner')
        if not uid:
            continue
        # Durable reservation before delivery avoids repeat messages. Ambiguous
        # provider errors remain visible for manual retry, never automatic spam.
        field = side + '_email_state'
        try:
            matches.update_item(Key={'match_id': match['match_id']}, UpdateExpression='SET #s = :s', ExpressionAttributeNames={'#s': field}, ExpressionAttributeValues={':s': 'sending'}, ConditionExpression=Attr(field).not_exists())
        except ClientError as exc:
            if exc.response['Error']['Code'] == 'ConditionalCheckFailedException':
                continue
            raise
        user = users.get_item(Key={'user_id': uid}, ConsistentRead=True).get('Item', {})
        state = 'failed'
        try:
            ses.send_email(FromEmailAddress=sender, Destination={'ToAddresses': [user['email']]}, Content={'Simple': {'Subject': {'Data': 'Bharat Talaash: a potential match needs your review'}, 'Body': {'Text': {'Data': f'A potential match has been found for your report. This is a candidate for human verification, not confirmation of identity.\n\nReview the evidence at {ORIGIN}/#dashboard and choose whether you consent to sharing your contact details. Contact details are available only after both reporters accept. No contact details are included in this email.\n\nMatch reference: {match["match_id"]}'}}}})
            state = 'sent'
        except (ClientError, KeyError):
            state = 'delivery_failed'
        matches.update_item(Key={'match_id': match['match_id']}, UpdateExpression='SET #s = :s', ExpressionAttributeNames={'#s': field}, ExpressionAttributeValues={':s': state})


def process_report(kind, rid, candidate_ids=None):
    table, key = (missing, 'case_id') if kind == 'missing' else (found, 'found_id')
    record = table.get_item(Key={key: rid}, ConsistentRead=True).get('Item')
    if not record or record.get('status') in {'closed', 'stopped'}:
        return
    try:
        matcher(8001 if kind == 'missing' else 8000, '/refresh', {'ids': [rid], 'embed_missing': True})
        payload = {'query': {k: v for k, v in record.items() if k in FIELDS}, 'top_n': 10}
        if candidate_ids is not None:
            payload['candidate_ids'] = candidate_ids
        data = matcher(8000 if kind == 'missing' else 8001, '/search' if kind == 'missing' else '/search/missing', payload)
        for score in data.get('matches', []):
            candidate = score.get('candidate', score)
            otherkey = 'found_id' if kind == 'missing' else 'case_id'
            other = (found if kind == 'missing' else missing).get_item(Key={otherkey: candidate[otherkey]}, ConsistentRead=True).get('Item')
            if other:
                save_matches(record if kind == 'missing' else other, other if kind == 'missing' else record, score)
        table.update_item(Key={key: rid}, UpdateExpression='SET search_status = :s ADD searches_performed :one', ExpressionAttributeValues={':s': 'completed', ':one': 1})
    except Exception:
        table.update_item(Key={key: rid}, UpdateExpression='SET search_status = :s', ExpressionAttributeValues={':s': 'failed'})
        raise


def monitor():
    # Official imports are written by the restricted scraper role. Schedule
    # their CPU index refresh through this Lambda, whose matcher transport is
    # already private and audited.
    official = []
    scan_args = {
        'FilterExpression': Attr('source').eq('ZIPNET') & Attr('embedding').not_exists(),
        'ProjectionExpression': 'case_id',
    }
    while len(official) < 500:
        scan = missing.scan(**scan_args)
        official.extend(item['case_id'] for item in scan.get('Items', []))
        if not scan.get('LastEvaluatedKey'):
            break
        scan_args['ExclusiveStartKey'] = scan['LastEvaluatedKey']
    for start in range(0, len(official), 50):
        enqueue({'task': 'official_missing_sync', 'ids': official[start:start + 50]})
    due = query_all(missing, IndexName='status-nextCheckAt-index', KeyConditionExpression=Key('status').eq('active') & Key('next_check_at').lte(now()))
    for case in due:
        if not case.get('reporter_user_id'):
            continue
        limit = int(case.get('monitoring_limit', FREE_RUNS))
        if int(case.get('monitoring_runs', 0)) >= limit:
            missing.update_item(Key={'case_id': case['case_id']}, UpdateExpression='SET monitoring_status = :s REMOVE next_check_at', ExpressionAttributeValues={':s': 'free_limit_reached'})
            continue
        # Atomic lease prevents overlapping scheduler deliveries. A failure leaves
        # the old cursor intact and schedules a retry, without charging a run.
        lease = str(uuid.uuid4())
        try:
            missing.update_item(Key={'case_id': case['case_id']}, UpdateExpression='SET monitor_lease = :l, lease_until = :u', ConditionExpression=Attr('status').eq('active') & (Attr('lease_until').not_exists() | Attr('lease_until').lt(now())), ExpressionAttributeValues={':l': lease, ':u': (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(timespec='seconds')})
        except ClientError as exc:
            if exc.response['Error']['Code'] == 'ConditionalCheckFailedException':
                continue
            raise
        enqueue({'task': 'monitor_case', 'id': case['case_id'], 'lease': lease})
    return {'due_cases': len(due), 'official_records_queued': len(official)}


def official_missing_sync(ids):
    if not isinstance(ids, list) or len(ids) > 50:
        raise ValueError('Invalid official sync batch')
    return matcher(8001, '/refresh', {'ids': ids, 'embed_missing': True})


def monitor_case(rid, lease):
    case = missing.get_item(Key={'case_id': rid}, ConsistentRead=True)['Item']
    if case.get('monitor_lease') != lease or case.get('status') != 'active':
        return
    # Five-minute overlap tolerates GSI propagation; deterministic pair IDs dedupe.
    upper = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(timespec='seconds')
    lower = (datetime.fromisoformat(case['last_checked_at']) - timedelta(minutes=5)).isoformat(timespec='seconds')
    ids = []
    for source in ('USER', 'ZIPNET'):
        records = query_all(found, IndexName='source-lastUpdatedAt-index', KeyConditionExpression=Key('source').eq(source) & Key('last_updated_at').between(lower, upper))
        ids.extend(r['found_id'] for r in records)
    if ids:
        # Batches keep SSM request/output sizes bounded and only rank new records.
        for start in range(0, len(ids), 100):
            process_report('missing', rid, ids[start:start + 100])
    missing.update_item(Key={'case_id': rid}, UpdateExpression='SET last_checked_at = :t, next_check_at = :n, monitoring_status = :s REMOVE monitor_lease, lease_until ADD monitoring_runs :one', ConditionExpression=Attr('monitor_lease').eq(lease) & Attr('status').eq('active'), ExpressionAttributeValues={':t': upper, ':n': later(), ':s': 'active', ':one': 1})
    audit(rid, None, 'system', 'monitoring_completed')


def dashboard(uid):
    cases = query_all(missing, IndexName='reporter_user_id-index', KeyConditionExpression=Key('reporter_user_id').eq(uid))
    reports = query_all(found, IndexName='reporter_user_id-index', KeyConditionExpression=Key('reporter_user_id').eq(uid))
    entries = {}
    activity = {}
    for rows, key, index in ((cases, 'case_id', 'case_id-index'), (reports, 'found_id', 'found_id-index')):
        for row in rows:
            for m in query_all(matches, IndexName=index, KeyConditionExpression=Key(key).eq(row[key])):
                if m.get('record_type') == 'candidate':
                    # GSI is eventually consistent: reread consent state strongly.
                    m = matches.get_item(Key={'match_id': m['match_id']}, ConsistentRead=True)['Item']
                    side = 'missing' if m.get('missing_owner') == uid else 'found'
                    if m.get(side + '_owner') != uid:
                        continue
                    entries[m['match_id']] = {k: v for k, v in m.items() if k not in {'missing_owner', 'found_owner'}}
                    entries[m['match_id']]['my_side'] = side
                    entries[m['match_id']]['can_consent'] = bool(m.get('missing_owner') and m.get('found_owner'))
                    if can_share(m):
                        other_side = 'found' if side == 'missing' else 'missing'
                        other = users.get_item(Key={'user_id': m[other_side + '_owner']}, ConsistentRead=True).get('Item', {})
                        entries[m['match_id']]['shared_contact'] = {'email': other.get('email')}
                elif m.get('record_type') == 'audit':
                    activity[m['match_id']] = {k: m[k] for k in ('action', 'created_at')}
    ownerfields = {'monitoring_status', 'monitoring_runs', 'monitoring_limit', 'next_check_at', 'search_status', 'searches_performed'}
    safe = lambda r: {**public_report(r), **{k: v for k, v in r.items() if k in ownerfields}}
    return {'cases': [safe(r) for r in cases], 'found_reports': [safe(r) for r in reports], 'matches': sorted(entries.values(), key=lambda r: r['created_at'], reverse=True), 'activity': sorted(activity.values(), key=lambda r: r['created_at'], reverse=True)[:30], 'stats': {'active_cases': sum(r.get('status') == 'active' for r in cases), 'found_reports': len(reports), 'potential_matches': len(entries), 'closed_cases': sum(r.get('status') == 'closed' for r in cases), 'searches_performed': sum(int(r.get('searches_performed', 0)) for r in cases + reports)}, 'email_mode': os.environ.get('EMAIL_MODE', 'sandbox')}


def consent(uid, body):
    mid, decision = str(body.get('match_id', '')), body.get('decision')
    if decision not in {'accepted', 'declined'}:
        raise ValueError('Choose accepted or declined')
    m = matches.get_item(Key={'match_id': mid}, ConsistentRead=True).get('Item', {})
    side = 'missing' if m.get('missing_owner') == uid else 'found' if m.get('found_owner') == uid else None
    if not side or m.get('record_type') != 'candidate':
        raise PermissionError('Match not available')
    if not m.get('missing_owner') or not m.get('found_owner'):
        raise ValueError('Official records require contacting the source authority')
    matches.update_item(Key={'match_id': mid}, UpdateExpression='SET #c = :d, updated_at = :t', ExpressionAttributeNames={'#c': side + '_consent'}, ExpressionAttributeValues={':d': decision, ':t': now()})
    audit(m['case_id'], m['found_id'], uid, side + '_consent_' + decision)
    return {'status': decision}


def update_case(uid, body):
    rid = str(body.get('case_id', ''))
    case = own(missing, {'case_id': rid}, uid)
    status = case_status(body.get('action'))
    values = {':s': status, ':t': now()}
    expression = 'SET #s = :s, updated_at = :t'
    if status == 'active' and int(case.get('monitoring_runs', 0)) < int(case.get('monitoring_limit', FREE_RUNS)):
        expression += ', next_check_at = :n, monitoring_status = :m'
        values.update({':n': later(), ':m': 'active'})
    else:
        expression += ', monitoring_status = :m REMOVE next_check_at, monitor_lease, lease_until'
        values[':m'] = 'paused' if status != 'active' else 'free_limit_reached'
    missing.update_item(Key={'case_id': rid}, UpdateExpression=expression, ExpressionAttributeNames={'#s': 'status'}, ExpressionAttributeValues=values, ConditionExpression=Attr('reporter_user_id').eq(uid))
    audit(rid, None, uid, body['action'])
    return {'status': status}


def start_extraction(uid, body):
    kind = body.get('input_type')
    if kind not in {'text', 'image', 'audio'}:
        raise ValueError('Unsupported input')
    job = {'match_id': 'EXTRACT#' + str(uuid.uuid4()), 'record_type': 'extraction', 'owner': uid, 'status': 'pending', 'created_at': now(), 'input_type': kind}
    if kind == 'text':
        text = body.get('text', '')
        if not isinstance(text, str) or not 5 <= len(text) <= 4000:
            raise ValueError('Enter 5 to 4000 characters')
        job['input_text'] = text
    else:
        types = {'image/jpeg': 'jpg', 'image/png': 'png', 'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/wav': 'wav', 'audio/mpeg': 'mp3'}
        content_type = str(body.get('content_type', '')).split(';')[0]
        if content_type not in types or not content_type.startswith(kind + '/'):
            raise ValueError('Unsupported media format')
        data = base64.b64decode(body.get('data', ''), validate=True)
        if not 1 <= len(data) <= 3 * 1024 * 1024:
            raise ValueError('Upload a file under 3 MB')
        if kind == 'image' and not (data.startswith(b'\xff\xd8\xff') or data.startswith(b'\x89PNG\r\n\x1a\n')):
            raise ValueError('Invalid image')
        key = f'private-inputs/{uid}/{uuid.uuid4()}.{types[content_type]}'
        s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=content_type, ServerSideEncryption='AES256')
        job['input_key'] = key
    matches.put_item(Item=job)
    enqueue({'task': 'extract', 'id': job['match_id']})
    return {'job_id': job['match_id'], 'status': 'pending'}


def extract_job(jid):
    import extraction_legacy as extraction
    job = matches.get_item(Key={'match_id': jid}, ConsistentRead=True)['Item']
    if job.get('status') == 'completed':
        return
    key = job.get('input_key')
    try:
        if job['input_type'] == 'image':
            draft = extraction.extract_from_image(BUCKET, key)
        else:
            transcript = extraction.transcribe_audio(BUCKET, key) if key else job['input_text']
            draft = extraction.extract_from_text(transcript)
        if not isinstance(draft, dict):
            raise ValueError('Invalid extraction')
        draft = {k: v for k, v in draft.items() if k in FIELDS | {'confidence_notes', 'original_language'} and isinstance(v, (str, int, float, type(None)))}
        matches.update_item(Key={'match_id': jid}, UpdateExpression='SET #s = :s, draft = :d REMOVE input_text', ExpressionAttributeNames={'#s': 'status'}, ExpressionAttributeValues={':s': 'completed', ':d': native(draft)})
    except Exception:
        matches.update_item(Key={'match_id': jid}, UpdateExpression='SET #s = :s REMOVE input_text', ExpressionAttributeNames={'#s': 'status'}, ExpressionAttributeValues={':s': 'failed'})
    finally:
        if key:
            s3.delete_object(Bucket=BUCKET, Key=key)


def search_text(uid, body):
    import extraction_legacy as extraction
    text = body.get('text', '')
    if body.get('input_type', 'text') != 'text' or not isinstance(text, str) or not 5 <= len(text) <= 4000:
        raise ValueError('Enter a description from 5 to 4000 characters')
    query = extraction.extract_from_text(text)
    data = matcher(8000, '/search', {'query': {k: v for k, v in query.items() if k in FIELDS and v not in (None, '')}, 'top_n': 5})
    users.update_item(Key={'user_id': uid}, UpdateExpression='ADD searches_performed :one', ExpressionAttributeValues={':one': 1})
    return {'status': 'completed', 'query': query, 'matching': data}


def lambda_handler(event, context):
    # Internal jobs are only accepted through IAM Lambda invocation, never via
    # an API body. API Gateway always supplies requestContext/httpMethod.
    if 'requestContext' not in event and 'httpMethod' not in event:
        task = event.get('task')
        if task == 'extract':
            return extract_job(event['id'])
        if task == 'official_missing_sync':
            return official_missing_sync(event.get('ids', []))
        if task == 'report':
            return process_report(event['kind'], event['id'])
        if task == 'monitor_case':
            return monitor_case(event['id'], event['lease'])
        return monitor()
    if event.get('httpMethod') == 'OPTIONS':
        return response(200, {})
    try:
        uid = authenticate(event)
        rate_limit(uid)
        raw = event.get('body') or '{}'
        if event.get('isBase64Encoded'):
            raw = base64.b64decode(raw).decode()
        if len(raw) > (4300000 if event.get('path', '').endswith('/extract') else 10000):
            raise ValueError('Request too large')
        body = json.loads(raw)
        path = event.get('path', '').rstrip('/')
        method = event.get('httpMethod')
        if path.endswith('/search') and method == 'POST':
            return response(200, search_text(uid, body))
        if path.endswith('/extract') and method == 'POST':
            return response(202, start_extraction(uid, body))
        if path.endswith('/jobs') and method == 'GET':
            jid = (event.get('queryStringParameters') or {}).get('id', '')
            job = matches.get_item(Key={'match_id': jid}, ConsistentRead=True).get('Item', {})
            if job.get('owner') != uid or job.get('record_type') != 'extraction':
                raise PermissionError()
            return response(200, {k: job[k] for k in ('status', 'draft') if k in job})
        if path.endswith('/dashboard') and method == 'GET':
            return response(200, dashboard(uid))
        if path.endswith('/case-status') and method == 'POST':
            return response(200, update_case(uid, body))
        if path.endswith('/consent') and method == 'POST':
            return response(200, consent(uid, body))
        if path.endswith('/missing') and method == 'POST':
            return response(201, create_report(uid, 'missing', body))
        if path.endswith('/found') and method == 'POST':
            return response(201, create_report(uid, 'found', body))
        return response(404, {'error': 'Route not found'})
    except PermissionError:
        return response(401, {'error': 'Sign in required or resource unavailable'})
    except OverflowError as exc:
        return response(429, {'error': str(exc)})
    except (ValueError, TypeError, KeyError):
        return response(400, {'error': 'Check the submitted details'})
    except Exception:
        # Never log person descriptions, tokens or AWS error payloads.
        print('request_failed', getattr(context, 'aws_request_id', 'unknown'))
        return response(503, {'error': 'Service temporarily unavailable'})

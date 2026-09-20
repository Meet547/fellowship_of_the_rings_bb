"""Pure validation and privacy rules. Scores rank candidates, never identities."""
import hashlib
import json
import re
from datetime import datetime, timezone

FIELDS = {'name', 'age', 'gender', 'last_seen_location', 'last_seen_date', 'location',
          'date_found', 'description', 'clothing', 'distinctive_marks', 'complexion', 'height_cm'}
PUBLIC = FIELDS | {'case_id', 'found_id', 'source', 'source_name', 'source_url',
                   'source_type', 'record_subtype', 'last_updated_at', 'created_at', 'status'}
EMAIL = re.compile(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}')
# Indian contact numbers only. Requiring a mobile prefix prevents ISO dates,
# case numbers and ages from being mistaken for phone numbers.
PHONE = re.compile(r'(?<!\w)(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\w)')


def redact(value):
    if isinstance(value, str):
        return PHONE.sub('[private contact]', EMAIL.sub('[private contact]', value))
    if isinstance(value, dict):
        return {k: redact(v) for k, v in value.items() if k not in {'contact', 'phone', 'email', 'address', 'reporter_user_id', 'embedding', 'private_contact'}}
    if isinstance(value, list):
        return [redact(v) for v in value]
    return value


def public_report(report):
    result = {k: redact(v) for k, v in report.items() if k in PUBLIC}
    # User free text can contain a residence or identifying contact instructions.
    # Public evidence only includes controlled fields; descriptions stay owner-only.
    if report.get('source') == 'USER' or report.get('source_type') == 'user':
        for key in ('description', 'distinctive_marks', 'clothing'):
            result.pop(key, None)
    return result


def validate_report(data, kind):
    if not isinstance(data, dict):
        raise ValueError('Expected a report object')
    clean = {}
    for field in FIELDS:
        value = data.get(field)
        if value is not None and str(value).strip():
            if not isinstance(value, (str, int, float)) or isinstance(value, bool):
                raise ValueError('Invalid report field')
            value = str(value).strip()
            if len(value) > (1800 if field == 'description' else 240):
                raise ValueError('Report field too long')
            clean[field] = value
    gender = clean.get('gender', 'unknown').lower()
    if gender not in {'male', 'female', 'other', 'unknown'}:
        raise ValueError('Invalid gender')
    clean['gender'] = gender
    age = clean.get('age', '')
    if age and (not re.fullmatch(r'\d{1,3}(?:\s*(?:-|to)\s*\d{1,3})?\+?', age) or any(int(n) > 120 for n in re.findall(r'\d+', age))):
        raise ValueError('Use an age or approximate age range from 0 to 120')
    location = 'last_seen_location' if kind == 'missing' else 'location'
    if len(clean.get(location, '')) < 2 or not any(clean.get(k) for k in ('name', 'age', 'description', 'clothing')):
        raise ValueError('Add location and at least one identifying detail')
    for field in ('last_seen_date', 'date_found'):
        if clean.get(field):
            try:
                parsed = datetime.fromisoformat(clean[field].replace('Z', '+00:00'))
                if parsed.date() > datetime.now(timezone.utc).date():
                    raise ValueError()
            except ValueError:
                raise ValueError('Use a valid date that is not in the future')
    return clean


def fingerprint(owner, kind, report):
    value = json.dumps([owner, kind, {k: str(v).casefold().strip() for k, v in sorted(report.items())}], ensure_ascii=False)
    return hashlib.sha256(value.encode()).hexdigest()


def strong_candidate(match):
    # Conservative demo threshold, not a calibrated probability.
    return float(match.get('final_score', 0)) >= 80 and float(match.get('data_completeness', 0)) >= 40 and float(match.get('structured_score', 0)) >= 60


def can_share(match):
    return match.get('missing_consent') == 'accepted' and match.get('found_consent') == 'accepted'


def case_status(action):
    states = {'satisfied': 'closed', 'not_satisfied': 'active', 'stop': 'stopped', 'matched': 'matched'}
    if action not in states:
        raise ValueError('Invalid case action')
    return states[action]

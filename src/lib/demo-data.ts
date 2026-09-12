/**
 * ---------------------------------------------------------------------------
 * DEMO DATA
 * ---------------------------------------------------------------------------
 * Every person, case, date and match on this page is an illustrative
 * example. Nothing here represents a real individual or a real case.
 *
 * This module is intentionally the single source of mock content so it can
 * later be replaced by real AWS Amplify / API calls (Bedrock, OpenSearch,
 * DynamoDB, S3, Step Functions) without touching any component.
 * ---------------------------------------------------------------------------
 */

export interface InvestigationStep {
  id: string;
  label: string;
  done: boolean;
}

export interface EvidenceCheck {
  field: string;
  caseValue: string;
  matchValue: string;
  ok: boolean;
}

export interface Lead {
  id: string;
  score: number;
  name: string;
  place: string;
  date: string;
  checks: EvidenceCheck[];
}

export interface TimelineEvent {
  date: string;
  time: string;
  title: string;
  place?: string;
  kind: "sighting" | "report" | "lead";
}

export interface SourceSearchStep {
  source: string;
  status: "done" | "running";
  note?: string;
}

export interface TechItem {
  name: string;
  role: string;
}

/* ------------------------------------------------------------------------- */
/* Hero preview — active investigation                                        */
/* ------------------------------------------------------------------------- */

export const DEMO_CASE = {
  person: "Rahul Sharma",
  age: 17,
  status: "Missing",
  city: "Mumbai",
  reported: "Aug 12",
  caseNo: "0142",
  leadCount: 3,
  sourcesSearched: 12,
  evidenceConnected: 4,
  lastUpdated: "18:32",
} as const;

export const INVESTIGATION_STEPS: InvestigationStep[] = [
  { id: "extract", label: "Case information extracted", done: true },
  { id: "records", label: "Missing-person records searched", done: true },
  { id: "news", label: "News sources searched", done: true },
  { id: "compare", label: "Potential matches compared", done: true },
];

export const DEMO_LEAD: Lead = {
  id: "lead-1",
  score: 91,
  name: "Rahul Sharma",
  place: "Surat",
  date: "Aug 14",
  checks: [
    { field: "Age", caseValue: "17", matchValue: "~17", ok: true },
    { field: "Date", caseValue: "Aug 12", matchValue: "Aug 14", ok: true },
    { field: "Location", caseValue: "Mumbai", matchValue: "Surat", ok: true },
    {
      field: "Description",
      caseValue: "Grey hoodie",
      matchValue: "Grey hoodie",
      ok: true,
    },
  ],
};

/* ------------------------------------------------------------------------- */
/* Investigation timeline (Aug 12 → Aug 14)                                   */
/* ------------------------------------------------------------------------- */

export const TIMELINE: TimelineEvent[] = [
  {
    date: "Aug 12",
    time: "17:40",
    title: "Last confirmed sighting",
    place: "Andheri Station",
    kind: "sighting",
  },
  {
    date: "Aug 13",
    time: "09:20",
    title: "Potential sighting",
    place: "Borivali",
    kind: "sighting",
  },
  {
    date: "Aug 14",
    time: "16:10",
    title: "Found-person report",
    place: "Surat",
    kind: "report",
  },
  {
    date: "Aug 14",
    time: "18:32",
    title: "Potential lead detected",
    kind: "lead",
  },
];

/* ------------------------------------------------------------------------- */
/* Connected search — source checklist                                        */
/* ------------------------------------------------------------------------- */

export const SOURCE_SEARCH: SourceSearchStep[] = [
  { source: "Missing-person records", status: "done", note: "Searched" },
  { source: "News sources", status: "done", note: "Searched" },
  { source: "Public records", status: "done", note: "Searched" },
  { source: "Comparing 3 potential matches", status: "running", note: "Running" },
];

/* ------------------------------------------------------------------------- */
/* Voice intake example                                                       */
/* ------------------------------------------------------------------------- */

export const VOICE_INTAKE = {
  transcript:
    "My brother Rahul is 17 and was last seen near Andheri station…",
  fields: [
    { label: "Name", value: "Rahul" },
    { label: "Age", value: "17" },
    { label: "Last seen", value: "Andheri Station" },
  ],
} as const;

/* ------------------------------------------------------------------------- */
/* Evidence graph — sources connected to a lead                               */
/* ------------------------------------------------------------------------- */

export const EVIDENCE_NODES = [
  { id: "news", label: "NEWS REPORT", side: "top" },
  { id: "sighting", label: "SIGHTING", side: "top" },
  { id: "location", label: "LOCATION", side: "bottom" },
  { id: "found", label: "FOUND-PERSON RECORD", side: "bottom" },
] as const;

/* ------------------------------------------------------------------------- */
/* Technology — understated infrastructure list                               */
/* ------------------------------------------------------------------------- */

export const TECH_STACK: TechItem[] = [
  { name: "AWS AMPLIFY", role: "Application & hosting" },
  { name: "AMAZON BEDROCK", role: "AI reasoning" },
  { name: "STRANDS", role: "Agent orchestration" },
  { name: "AMAZON OPENSEARCH", role: "Search & retrieval" },
  { name: "DYNAMODB", role: "Case data" },
  { name: "AMAZON S3", role: "Evidence storage" },
  { name: "AWS STEP FUNCTIONS", role: "Investigation workflows" },
];

/* ------------------------------------------------------------------------- */
/* Footer                                                                     */
/* ------------------------------------------------------------------------- */

export const FOOTER_GROUPS: { title: string; links: string[] }[] = [
  {
    title: "PRODUCT",
    links: ["How it works", "Start a search", "Found someone"],
  },
  {
    title: "INVESTIGATE",
    links: ["Cases", "Evidence", "Timeline"],
  },
  {
    title: "RESOURCES",
    links: ["Safety", "Privacy", "Sources"],
  },
  {
    title: "TECHNOLOGY",
    links: ["AWS", "Bedrock", "Strands"],
  },
];

export const FOOTNOTES = [
  "KHOJ is an investigation assistant, not a government agency or law enforcement service. It does not provide legal advice.",
  "A potential match is not a confirmed identity. Leads are starting points for verification by the people involved and, where appropriate, the authorities.",
  "KHOJ searches public and authorized sources only, and cites the source behind every result.",
  "This page contains demonstration data. People, cases and matches shown are illustrative examples — not real individuals.",
] as const;

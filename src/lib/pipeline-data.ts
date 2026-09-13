/**
 * ---------------------------------------------------------------------------
 * PIPELINE DATA — the agentic investigation run (demo)
 * ---------------------------------------------------------------------------
 * Mirrors what Strands Agents + Bedrock + Step Functions will orchestrate in
 * production: four coordinated agents, each with explicit tasks. Every
 * person, record and score here is an illustrative example — no real
 * records are searched.
 * ---------------------------------------------------------------------------
 */

import type { EvidenceCheck } from "@/lib/demo-data";

export interface PipelineTask {
  id: string;
  label: string;
  /** Small result note revealed when the task completes. */
  detail?: string;
  /** How long the bullet stays "running" (ms) in the demo. */
  duration: number;
}

export interface PipelineStage {
  id: string;
  index: string;
  agent: string;
  engine: string;
  goal: string;
  tasks: PipelineTask[];
}

export interface ResultLead {
  id: string;
  score: number;
  confidence: "high" | "medium" | "low";
  title: string;
  place: string;
  date: string;
  summary: string;
  checks: EvidenceCheck[];
  sources: string[];
  flag?: string;
}

/* ------------------------------------------------------------------------- */
/* The four agents                                                           */
/* ------------------------------------------------------------------------- */

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "intake",
    index: "01",
    agent: "Intake agent",
    engine: "Strands · Bedrock",
    goal: "Turn your description into a structured case.",
    tasks: [
      { id: "read", label: "Reading your description", duration: 750 },
      {
        id: "person",
        label: "Extracting person details",
        detail: "name · age · appearance",
        duration: 900,
      },
      {
        id: "places",
        label: "Identifying places and times",
        detail: "Andheri Station · Aug 12",
        duration: 850,
      },
      { id: "record", label: "Creating case record", detail: "#0142", duration: 650 },
    ],
  },
  {
    id: "search",
    index: "02",
    agent: "Search agent",
    engine: "Strands · OpenSearch",
    goal: "Search connected public and authorized sources.",
    tasks: [
      {
        id: "missing",
        label: "Searching missing-person records",
        detail: "12 databases",
        duration: 950,
      },
      {
        id: "news",
        label: "Searching news sources",
        detail: "14 relevant articles",
        duration: 1000,
      },
      {
        id: "public",
        label: "Searching public records",
        detail: "6 records",
        duration: 850,
      },
      {
        id: "found",
        label: "Collecting found-person reports",
        detail: "2 reports",
        duration: 800,
      },
    ],
  },
  {
    id: "match",
    index: "03",
    agent: "Matching agent",
    engine: "Strands · Bedrock",
    goal: "Compare candidates against the case evidence.",
    tasks: [
      {
        id: "gather",
        label: "Gathering candidate records",
        detail: "7 candidates",
        duration: 850,
      },
      {
        id: "compare",
        label: "Comparing age, date, location, description",
        duration: 1000,
      },
      {
        id: "score",
        label: "Scoring evidence overlap",
        detail: "3 kept for review",
        duration: 900,
      },
    ],
  },
  {
    id: "lead",
    index: "04",
    agent: "Lead agent",
    engine: "Strands · Step Functions",
    goal: "Rank leads and attach their evidence.",
    tasks: [
      { id: "rank", label: "Ranking leads by evidence strength", duration: 750 },
      { id: "sources", label: "Attaching sources to each lead", duration: 800 },
      { id: "timeline", label: "Building the investigation timeline", duration: 700 },
    ],
  },
];

/** Extra pause between stages (ms) so status chips are readable. */
export const STAGE_GAP = 420;

/* ------------------------------------------------------------------------- */
/* Extracted case summary — appears after the intake agent finishes          */
/* ------------------------------------------------------------------------- */

export const EXTRACTED_CASE = {
  caseNo: "0142",
  status: "Missing",
  fields: [
    { label: "Name", value: "Rahul Sharma" },
    { label: "Age", value: "17" },
    { label: "Last seen", value: "Andheri Station · Aug 12, 17:40" },
    { label: "Clothing", value: "Grey hoodie" },
  ],
} as const;

/* ------------------------------------------------------------------------- */
/* Sample intake description (matches the landing-page voice example)         */
/* ------------------------------------------------------------------------- */

export const SAMPLE_DESCRIPTION =
  "My brother Rahul is 17. He was last seen near Andheri station on August 12 " +
  "around 5:40 in the evening, wearing a grey hoodie. He hasn't answered his " +
  "phone since, and we filed a report the next morning. He sometimes travels " +
  "out of the city by train.";

/* ------------------------------------------------------------------------- */
/* Final leads — honest scoring, sources on every lead                        */
/* ------------------------------------------------------------------------- */

export const RESULT_LEADS: ResultLead[] = [
  {
    id: "lead-1",
    score: 91,
    confidence: "high",
    title: "Found-person record — Surat shelter intake",
    place: "Surat",
    date: "Aug 14",
    summary:
      "A found-person report from Surat matches the case on age, timeframe, " +
      "route logic and clothing description.",
    checks: [
      { field: "Age", caseValue: "17", matchValue: "~17", ok: true },
      { field: "Date", caseValue: "Aug 12", matchValue: "Aug 14", ok: true },
      { field: "Location", caseValue: "Mumbai", matchValue: "Surat", ok: true },
      { field: "Description", caseValue: "Grey hoodie", matchValue: "Grey hoodie", ok: true },
    ],
    sources: [
      "Found-person report · Surat · Aug 14",
      "News article · regional press · Aug 15",
      "Shelter intake log · Surat",
    ],
  },
  {
    id: "lead-2",
    score: 64,
    confidence: "medium",
    title: "Unidentified male — shelter intake",
    place: "Vadodara",
    date: "Aug 13",
    summary:
      "Age and timeframe are consistent, but the clothing description could " +
      "not be confirmed and the location is off the expected route.",
    checks: [
      { field: "Age", caseValue: "17", matchValue: "16–18", ok: true },
      { field: "Date", caseValue: "Aug 12", matchValue: "Aug 13", ok: true },
      { field: "Location", caseValue: "Mumbai", matchValue: "Vadodara", ok: false },
      {
        field: "Description",
        caseValue: "Grey hoodie",
        matchValue: "Hoodie, colour unclear",
        ok: false,
      },
    ],
    sources: ["Shelter intake log · Vadodara · Aug 13", "Public records search"],
    flag: "Clothing description not confirmed",
  },
  {
    id: "lead-3",
    score: 52,
    confidence: "low",
    title: "Patrol sighting — highway checkpoint",
    place: "Bharuch",
    date: "Aug 13",
    summary:
      "A patrol log notes a young male travelling alone on the NH48 corridor. " +
      "Age estimate fits; clothing is only partially described.",
    checks: [
      { field: "Age", caseValue: "17", matchValue: "~17", ok: true },
      { field: "Date", caseValue: "Aug 12", matchValue: "Aug 13", ok: true },
      { field: "Location", caseValue: "Mumbai", matchValue: "Bharuch", ok: false },
      { field: "Description", caseValue: "Grey hoodie", matchValue: "Grey jacket", ok: false },
    ],
    sources: ["Patrol log · NH48 · Aug 13"],
    flag: "Second-hand sighting, unverified",
  },
];

export const RESULT_STATS = [
  { label: "Sources searched", value: "12" },
  { label: "Evidence connected", value: "4" },
  { label: "Potential leads", value: "3" },
] as const;

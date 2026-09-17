export type ViewName =
  | "landing"
  | "signin"
  | "signup"
  | "onboarding"
  | "dashboard"
  | "find"
  | "found"
  | "search"
  | "results"
  | "case"
  | "profile"
  | "cases"
  | "messages"
  | "saved"
  | "resources";

export type Role =
  | "Family Member"
  | "Citizen"
  | "NGO / Shelter"
  | "Authority"
  | "Researcher"
  | "Other";

export interface User {
  firstName: string;
  fullName: string;
  email: string;
  role: Role;
  initials: string;
}

export type SourceKind =
  | "Maharashtra Police"
  | "Government Record"
  | "NGO Record"
  | "Shelter Record"
  | "Community Report"
  | "Public Report";

export interface MatchPerson {
  id: string;
  name: string;
  match: number;
  gender: string;
  age: string;
  location: string;
  dateLabel: string;
  source: SourceKind;
  photo: string | null; // null => silhouette
  foundLabel?: string;
}

export interface CaseItem {
  id: string;
  person: string;
  detail: string;
  status: "Searching" | "In Review" | "More Info Needed" | "Reunited";
  updated: string;
}

export const MATCH_PEOPLE: MatchPerson[] = [
  {
    id: "mp-1",
    name: "Ramesh Kumar",
    match: 76,
    gender: "Male",
    age: "~ 62 years",
    location: "Andheri, Mumbai, Maharashtra",
    dateLabel: "12 Sep 2026",
    source: "Maharashtra Police",
    photo: "/images/portrait-ramesh.jpg",
  },
  {
    id: "mp-2",
    name: "Unknown (Unidentified)",
    match: 64,
    gender: "Male",
    age: "~ 60-65 years",
    location: "Mumbai, Maharashtra",
    dateLabel: "Found: 10 Sep 2026",
    source: "NGO Record",
    photo: null,
  },
  {
    id: "mp-3",
    name: "Suresh Patil",
    match: 52,
    gender: "Male",
    age: "~ 58 years",
    location: "Navi Mumbai, Maharashtra",
    dateLabel: "Reported Missing: 8 Sep 2026",
    source: "Community Report",
    photo: "/images/portrait-suresh.jpg",
  },
  {
    id: "mp-4",
    name: "Mahesh Yadav",
    match: 47,
    gender: "Male",
    age: "~ 65 years",
    location: "Dadar, Mumbai, Maharashtra",
    dateLabel: "Found: 6 Sep 2026",
    source: "Shelter Record",
    photo: "/images/portrait-suresh.jpg",
  },
  {
    id: "mp-5",
    name: "Unknown (Unidentified)",
    match: 41,
    gender: "Male",
    age: "~ 60-70 years",
    location: "Thane, Maharashtra",
    dateLabel: "Found: 2 Sep 2026",
    source: "Government Record",
    photo: null,
  },
  {
    id: "mp-6",
    name: "Ramesh Kumbhar",
    match: 38,
    gender: "Male",
    age: "~ 61 years",
    location: "Kalyan, Maharashtra",
    dateLabel: "Reported Missing: 30 Aug 2026",
    source: "Maharashtra Police",
    photo: "/images/portrait-ramesh.jpg",
  },
];

export const SEARCH_RESULTS: MatchPerson[] = [
  {
    id: "sr-1",
    name: "Ramesh Kumar",
    match: 78,
    gender: "Male",
    age: "~ 62 years",
    location: "Thane, Maharashtra",
    dateLabel: "Found: 12 Sep 2026",
    source: "Maharashtra Police",
    photo: "/images/portrait-ramesh.jpg",
  },
  {
    id: "sr-2",
    name: "Unknown (Unidentified)",
    match: 64,
    gender: "Male",
    age: "~ 60-65 years",
    location: "Mumbai, Maharashtra",
    dateLabel: "Found: 10 Sep 2026",
    source: "Government Record",
    photo: null,
  },
  {
    id: "sr-3",
    name: "Suresh Patil",
    match: 62,
    gender: "Male",
    age: "~ 58 years",
    location: "Navi Mumbai, Maharashtra",
    dateLabel: "Reported Missing: 8 Sep 2026",
    source: "NGO Record",
    photo: "/images/portrait-suresh.jpg",
  },
  {
    id: "sr-4",
    name: "Unknown (Unidentified)",
    match: 48,
    gender: "Male",
    age: "~ 70 years",
    location: "Thane, Maharashtra",
    dateLabel: "Found: 5 Sep 2026",
    source: "Shelter Record",
    photo: null,
  },
];

export const RECENT_CASES: CaseItem[] = [
  {
    id: "#KHUJ-2026-001",
    person: "Ramesh Kumar",
    detail: "Andheri, Mumbai",
    status: "Searching",
    updated: "2 hours ago",
  },
  {
    id: "#KHUJ-2026-002",
    person: "Unknown (Found Person)",
    detail: "Thane, MH",
    status: "More Info Needed",
    updated: "1 day ago",
  },
];

export const QUICK_ACTIONS = [
  { icon: "search", label: "Search database", desc: "Look across records" },
  { icon: "flag", label: "Report a new case", desc: "Found someone?" },
  { icon: "map", label: "Find nearby support", desc: "NGOs & shelters" },
  { icon: "phone", label: "Emergency contacts", desc: "Helplines" },
] as const;

export const ONBOARDING_ROLES: {
  role: Role;
  desc: string;
  icon: string;
}[] = [
  { role: "Family Member", desc: "Looking for a loved one", icon: "heart" },
  { role: "Citizen", desc: "Help identify or report", icon: "user" },
  { role: "NGO / Shelter", desc: "Support and cases", icon: "building" },
  { role: "Authority", desc: "Police or government", icon: "shield" },
  { role: "Researcher", desc: "Access public data", icon: "flask" },
  { role: "Other", desc: "General use", icon: "sparkle" },
];

export const SEARCH_STEPS = ["Describe", "Review", "Search", "Results"];
export const REPORT_STEPS = ["Share", "Details", "Review", "Submit"];

export const DESCRIBE_CHIPS = [
  "e.g. My father went missing from Andheri..",
  "A 10 year old girl, last seen in Delhi..",
  "A person with no memory, found in..",
];

export const REPORT_CHIPS = [
  "e.g. Found at Dadar station...",
  "Person seems confused...",
  "Elderly female...",
];

export const SEARCH_TIPS = [
  "You don't need to know everything. Enter whatever details you have.",
  "Try different spellings or short forms.",
  "You can also search using a photo (coming soon).",
];

export const DESCRIBE_TIPS = [
  "You don't need to know everything.",
  "Even small details can help.",
  "You can add a photo later.",
  "Try mentioning location, date, clothing or any unique features.",
];

export const SEARCH_SOURCES = [
  { icon: "landmark", label: "Police & Government Records" },
  { icon: "building", label: "NGO & Shelter Databases" },
  { icon: "news", label: "Public Reports & News" },
  { icon: "share", label: "Social Media (Public)" },
  { icon: "users", label: "Community Submissions" },
];

export const SEARCH_TASKS = [
  "Understanding your query",
  "Searching government databases",
  "Checking NGO and shelter records",
  "Scanning public sources and news reports",
  "Finding possible matches",
];

export const EXTRACTED_FIELDS: {
  key: string;
  label: string;
  value: string;
}[] = [
  { key: "name", label: "Name", value: "Ramesh Kumar" },
  { key: "age", label: "Age", value: "Around 62 years" },
  { key: "gender", label: "Gender", value: "Male" },
  {
    key: "location",
    label: "Last known location",
    value: "Andheri, Mumbai, Maharashtra",
  },
  { key: "date", label: "Date missing", value: "12 September 2026" },
  { key: "clothing", label: "Clothing", value: "Blue shirt, black trousers" },
  {
    key: "other",
    label: "Other details",
    value: "Wears glasses, has a small scar",
  },
];

export const INDIAN_STATES = [
  "Any",
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Kerala",
  "Bihar",
  "Madhya Pradesh",
];

export const GENDERS = ["Any", "Male", "Female", "Other"];

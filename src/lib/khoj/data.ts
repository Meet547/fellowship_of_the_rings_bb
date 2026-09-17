export type Person = {
  id: string;
  name: string;
  img: string;
  gender: string;
  age: string;
  location: string;
  since: string;
  status: "missing" | "found";
  match?: number;
  lastSeen?: string;
  foundIn?: string;
  source?: string;
  relative?: string;
};

export const PEOPLE: Person[] = [
  {
    id: "MP-2481",
    name: "Aarav Mehta",
    img: "/images/khoj-aarav.jpg",
    gender: "Male",
    age: "14 years",
    location: "Mumbai, Maharashtra",
    since: "Missing since 12 Aug 2025",
    status: "missing",
  },
  {
    id: "MP-2317",
    name: "Sunita Devi",
    img: "/images/khoj-sunita.jpg",
    gender: "Female",
    age: "32 years",
    location: "Patna, Bihar",
    since: "Missing since 03 Jul 2025",
    status: "missing",
  },
  {
    id: "MP-2204",
    name: "Ramesh Kumar",
    img: "/images/khoj-rameshkumar.jpg",
    gender: "Male",
    age: "67 years",
    location: "Delhi, India",
    since: "Missing since 21 Jun 2025",
    status: "missing",
  },
  {
    id: "MP-2190",
    name: "Unknown (Unidentified)",
    img: "/images/khoj-unknown.jpg",
    gender: "Male",
    age: "Approx. 40-60 years",
    location: "Delhi, India",
    since: "Found on 16 Aug 2025",
    status: "found",
  },
];

export const MATCH: Person = {
  id: "MP-2077",
  name: "Ramesh Sharma",
  img: "/images/khoj-ramesh.jpg",
  gender: "Male",
  age: "62 years",
  location: "Dadar, Mumbai",
  since: "Missing since 2 days ago",
  status: "missing",
  match: 78,
  lastSeen: "Dadar, Mumbai (2 days ago)",
  foundIn: "Thane (via public report)",
  source: "NGO Database + News Article",
  relative: "Contact available",
};

export const DB_STATS = [
  { value: 248950, label: "Missing person records", suffix: "" },
  { value: 36420, label: "People reunited", suffix: "" },
  { value: 1200, label: "Partner NGOs", suffix: "+" },
  { value: 28, label: "States covered", suffix: "" },
];

export const SEARCH_STAGES = [
  "Processing Photo",
  "Scanning Databases",
  "Checking News & Media",
  "Searching Social Platforms",
  "Matching with NGO Records",
  "Finalising Results",
];

export const EXAMPLE_QUERIES = [
  "Elderly man with memory loss",
  "Child in school uniform",
  "Found at railway station",
  "Person with specific ID marks",
];

export const SEARCH_TIPS = [
  "Include age (approximate is fine)",
  "Mention last seen location",
  "Add clothing or physical features",
  "Include any known name or aliases",
  "You can also upload a photo or use voice search",
];

export const SCAN_TIPS = [
  "Clear front-facing photo",
  "Good lighting",
  "Include face and shoulders",
  "Avoid blurry images",
  "Works for both living and deceased",
];

export const WAIT_TIPS = [
  { icon: "phone", text: "Keep your phone nearby for updates" },
  { icon: "mail", text: "Check your email for results" },
  { icon: "users", text: "You can continue using KHOJ in the meantime" },
];

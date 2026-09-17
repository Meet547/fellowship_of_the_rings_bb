"use client";

import { create } from "zustand";
import type { Role, User, ViewName } from "./data";
import { EXTRACTED_FIELDS, MATCH_PEOPLE } from "./data";

export interface FoundReport {
  photoName: string | null;
  description: string;
  ageRange: string;
  gender: string;
  foundLocation: string;
  theySay: string;
  otherDetails: string;
}

export interface SearchFilters {
  name: string;
  age: string;
  gender: string;
  state: string;
  city: string;
}

interface KhojState {
  view: ViewName;
  selectedCaseId: string | null;

  // auth
  authName: string;
  authEmail: string;
  authPassword: string;

  user: User | null;

  // onboarding
  onboardingStep: number; // 0..2
  role: Role | null;
  phone: string;
  city: string;
  prefsEmail: boolean;
  prefsSms: boolean;
  prefsWhatsapp: boolean;

  // find someone flow
  findStep: number; // 0..3
  findDescription: string;
  findPhotoName: string | null;
  searchProgress: number; // 0..5 tasks completed

  // found someone flow
  foundStep: number; // 0..3
  foundReport: FoundReport;

  // search page
  filters: SearchFilters;

  saved: string[];
  activeCaseId: string;

  navigate: (view: ViewName) => void;
  openCase: (id: string) => void;

  setAuth: (patch: Partial<Pick<KhojState, "authName" | "authEmail" | "authPassword">>) => void;
  signInDemo: () => void;
  signUp: (name: string, email: string) => void;
  signOut: () => void;

  setOnboardingStep: (s: number) => void;
  setRole: (r: Role) => void;
  setOnboardingDetail: (patch: Partial<Pick<KhojState, "phone" | "city" | "prefsEmail" | "prefsSms" | "prefsWhatsapp">>) => void;
  finishOnboarding: () => void;

  setFindStep: (s: number) => void;
  setFindDescription: (d: string) => void;
  setFindPhotoName: (n: string | null) => void;
  setSearchProgress: (n: number) => void;

  setFoundStep: (s: number) => void;
  setFoundReport: (patch: Partial<FoundReport>) => void;
  resetFound: () => void;

  setFilters: (patch: Partial<SearchFilters>) => void;

  toggleSaved: (id: string) => void;
  setActiveCase: (id: string) => void;
}

const emptyFound: FoundReport = {
  photoName: null,
  description: "",
  ageRange: "",
  gender: "",
  foundLocation: "",
  theySay: "",
  otherDetails: "",
};

export const useKhoj = create<KhojState>((set, get) => ({
  view: "landing",
  selectedCaseId: null,

  authName: "",
  authEmail: "",
  authPassword: "",

  user: null,

  onboardingStep: 0,
  role: null,
  phone: "",
  city: "",
  prefsEmail: true,
  prefsSms: false,
  prefsWhatsapp: true,

  findStep: 0,
  findDescription: "",
  findPhotoName: null,
  searchProgress: 0,

  foundStep: 0,
  foundReport: emptyFound,

  filters: { name: "", age: "", gender: "Any", state: "Any", city: "" },

  saved: [],
  activeCaseId: "#KHUJ-2026-001",

  navigate: (view) => {
    set({ view });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },

  openCase: (id) => {
    set({ selectedCaseId: id, view: "case" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },

  setAuth: (patch) => set(patch),

  signInDemo: () =>
    set({
      user: {
        firstName: "Meet",
        fullName: "Meet Pardeshi",
        email: get().authEmail || "meet@example.com",
        role: "Family Member",
        initials: "MP",
      },
    }),

  signUp: (name, email) => {
    const first = name.trim().split(/\s+/)[0] || "There";
    const initials =
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "MP";
    set({
      user: {
        firstName: first,
        fullName: name.trim() || "Meet Pardeshi",
        email: email || "meet@example.com",
        role: "Family Member",
        initials,
      },
    });
  },

  signOut: () =>
    set({
      user: null,
      view: "landing",
      onboardingStep: 0,
      role: null,
      findStep: 0,
      foundStep: 0,
      searchProgress: 0,
    }),

  setOnboardingStep: (s) => set({ onboardingStep: s }),
  setRole: (r) => set({ role: r }),
  setOnboardingDetail: (patch) => set(patch),

  finishOnboarding: () => {
    const { role, user } = get();
    if (user && role) {
      set({ user: { ...user, role }, view: "dashboard" });
    } else {
      set({ view: "dashboard" });
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },

  setFindStep: (s) => {
    set({ findStep: s, searchProgress: s === 2 ? 0 : get().searchProgress });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },
  setFindDescription: (d) => set({ findDescription: d }),
  setFindPhotoName: (n) => set({ findPhotoName: n }),
  setSearchProgress: (n) => set({ searchProgress: n }),

  setFoundStep: (s) => {
    set({ foundStep: s });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  },
  setFoundReport: (patch) => set({ foundReport: { ...get().foundReport, ...patch } }),
  resetFound: () => set({ foundReport: emptyFound, foundStep: 0 }),

  setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

  toggleSaved: (id) => {
    const saved = get().saved;
    set({ saved: saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id] });
  },
  setActiveCase: (id) => set({ activeCaseId: id }),
}));

export function extractedFor(description: string) {
  // deterministic "AI extraction" — same fields as the design mock
  void description;
  return EXTRACTED_FIELDS;
}

export function matchesForFind() {
  return MATCH_PEOPLE;
}

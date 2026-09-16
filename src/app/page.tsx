"use client";

import { AnimatePresence, motion } from "framer-motion";
import Landing from "@/components/khoj/landing";
import { SignIn, SignUp } from "@/components/khoj/auth";
import Onboarding from "@/components/khoj/onboarding";
import Dashboard from "@/components/khoj/dashboard";
import FindSomeone from "@/components/khoj/find-someone";
import FoundSomeone from "@/components/khoj/found-someone";
import { SearchPage, SearchResultsPage } from "@/components/khoj/search";
import CaseDetails from "@/components/khoj/case-details";
import {
  Messages,
  MyCases,
  Profile,
  Resources,
  SavedPage,
} from "@/components/khoj/pages";
import { useKhoj } from "@/lib/khoj/store";

export default function Home() {
  const view = useKhoj((s) => s.view);

  return (
    <div className="min-h-screen bg-paper">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.21, 0.65, 0.35, 1] }}
        >
          {view === "landing" && <Landing />}
          {view === "signin" && <SignIn />}
          {view === "signup" && <SignUp />}
          {view === "onboarding" && <Onboarding />}
          {view === "dashboard" && <Dashboard />}
          {view === "find" && <FindSomeone />}
          {view === "found" && <FoundSomeone />}
          {view === "search" && <SearchPage />}
          {view === "results" && <SearchResultsPage />}
          {view === "case" && <CaseDetails />}
          {view === "profile" && <Profile />}
          {view === "cases" && <MyCases />}
          {view === "messages" && <Messages />}
          {view === "saved" && <SavedPage />}
          {view === "resources" && <Resources />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

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
import { EASE, EASE_INOUT } from "@/components/khoj/shared";

export default function Home() {
  const view = useKhoj((s) => s.view);

  return (
    <div className="min-h-screen bg-paper">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, transition: { duration: 0.28, ease: EASE_INOUT } }}
          transition={{ duration: 0.55, ease: EASE }}
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

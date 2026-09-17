"use client";

import { AnimatePresence, motion } from "framer-motion";
import Landing from "@/components/khoj/landing";
import Auth from "@/components/khoj/auth";
import AppShell from "@/components/khoj/shell";
import Dashboard from "@/components/khoj/dashboard";
import Database from "@/components/khoj/database";
import Find from "@/components/khoj/find";
import Scan from "@/components/khoj/scan";
import Report from "@/components/khoj/report";
import PageLoader from "@/components/khoj/page-loader";
import Searching from "@/components/khoj/searching";
import Match from "@/components/khoj/match";
import NotFoundView from "@/components/khoj/not-found";
import SiteFooter from "@/components/khoj/footer";
import { ToastProvider } from "@/components/khoj/ui";
import { useView } from "@/lib/khoj/router";
import { useEffect, useState, type ReactNode } from "react";

function RouteTransition({ view, navigate, children }: { view: string; navigate: ReturnType<typeof useView>["navigate"]; children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <PageLoader />}</AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
          <SiteFooter navigate={navigate} />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const { view, navigate, authStatus } = useView();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  const appViews = ["dashboard", "database", "find", "scan"];
  const isApp = appViews.includes(view);

  const content = (() => {
    if (authStatus === "loading") return <PageLoader />;
    switch (view) {
      case "landing":
        return <Landing navigate={navigate} />;
      case "auth":
        return <Auth navigate={navigate} />;
      case "dashboard":
        return (
          <AppShell active="dashboard" navigate={navigate}>
            <Dashboard navigate={navigate} />
          </AppShell>
        );
      case "database":
        return (
          <AppShell active="database" navigate={navigate}>
            <Database navigate={navigate} />
          </AppShell>
        );
      case "find":
        return (
          <AppShell active="find" navigate={navigate}>
            <Find navigate={navigate} />
          </AppShell>
        );
      case "scan":
        return (
          <AppShell active="scan" navigate={navigate}>
            <Scan navigate={navigate} />
          </AppShell>
        );
      case "report":
        return <Report navigate={navigate} />;
      case "searching":
        return <Searching navigate={navigate} />;
      case "match":
        return <Match navigate={navigate} />;
      case "not-found":
        return <NotFoundView navigate={navigate} />;
      default:
        return <Landing navigate={navigate} />;
    }
  })();

  return (
    <ToastProvider>
      <div className={`min-h-screen ${isApp ? "bg-paper" : "bg-paper"}`}>
        <RouteTransition key={view} view={view} navigate={navigate}>{content}</RouteTransition>
      </div>
    </ToastProvider>
  );
}

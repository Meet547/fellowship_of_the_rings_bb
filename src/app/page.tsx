import { Navbar } from "@/components/khoj/navbar";
import { Hero } from "@/components/khoj/hero";
import { FlowerSection } from "@/components/khoj/diagram";
import { HowItWorks } from "@/components/khoj/how-it-works";
import { FeatureCards } from "@/components/khoj/feature-cards";
import { FeatureSection } from "@/components/khoj/feature-section";
import { TwoSided } from "@/components/khoj/two-sided";
import { Guides } from "@/components/khoj/guides";
import { FinalCTA } from "@/components/khoj/final-cta";
import { Footer } from "@/components/khoj/footer";
import dynamic from "next/dynamic";

const EvidenceSection = dynamic(
  () => import("@/components/khoj/evidence-section").then((mod) => mod.EvidenceSection),
  { loading: () => <SectionPlaceholder /> },
);
const TechnologySection = dynamic(
  () => import("@/components/khoj/technology-section").then((mod) => mod.TechnologySection),
  { loading: () => <SectionPlaceholder /> },
);

function SectionPlaceholder() {
  return <div className="mx-auto h-24 max-w-[1200px]" aria-hidden="true" />;
}

/**
 * KHOJ — landing page.
 * Section order mirrors the reference design's visual rhythm:
 * navbar → hero (+ investigation preview) → flower diagram → how it works
 * → capability cards → evidence (tabs + graph) → workflows (alternating rows)
 * → two directions → guides → technology → final CTA → footer.
 *
 * All product data on this page is demonstrative — see src/lib/demo-data.ts.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main id="top">
        <Hero />

        {/* lavender band */}
        <div className="bg-lav">
          <FlowerSection />
          <HowItWorks />
          <FeatureCards />
          <EvidenceSection />
        </div>

        {/* near-white band */}
        <div className="bg-paper">
          <FeatureSection />
          <TwoSided />
        </div>

        {/* cream band */}
        <Guides />
        <TechnologySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/khoj/navbar";
import { Hero } from "@/components/khoj/hero";
import { FlowerSection } from "@/components/khoj/diagram";
import { HowItWorks } from "@/components/khoj/how-it-works";
import { FeatureCards } from "@/components/khoj/feature-cards";
import { EvidenceSection } from "@/components/khoj/evidence-section";
import { FeatureSection } from "@/components/khoj/feature-section";
import { TwoSided } from "@/components/khoj/two-sided";
import { Guides } from "@/components/khoj/guides";
import { TechnologySection } from "@/components/khoj/technology-section";
import { FinalCTA } from "@/components/khoj/final-cta";
import { Footer } from "@/components/khoj/footer";

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

import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { AgentShowcase } from "@/components/landing/agent-showcase";
import { WorkflowAnimation } from "@/components/landing/workflow-animation";
import { ComparisonSection } from "@/components/landing/comparison";
import { PricingSection } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <AgentShowcase />
        <WorkflowAnimation />
        <PricingSection />
        <ComparisonSection />
      </main>
      <Footer />
    </div>
  );
}

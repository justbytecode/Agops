import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Shield, 
  Zap, 
  Activity, 
  GitBranch, 
  Server,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Agents",
    description: "Autonomous agents that monitor, diagnose, and remediate issues 24/7 without human intervention."
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Unified observability across all your infrastructure with intelligent anomaly detection."
  },
  {
    icon: Shield,
    title: "Security Scanning",
    description: "Continuous vulnerability scanning and compliance monitoring with automated remediation."
  },
  {
    icon: GitBranch,
    title: "CI/CD Integration",
    description: "Seamlessly integrate with your existing pipelines for automated deployment management."
  },
  {
    icon: Zap,
    title: "Instant Remediation",
    description: "AI agents automatically fix common issues, reducing MTTR by up to 80%."
  },
  {
    icon: Server,
    title: "Infrastructure Control",
    description: "Manage Kubernetes, cloud resources, and on-prem servers from a single dashboard."
  }
];

const benefits = [
  "Reduce incident response time by 80%",
  "24/7 autonomous monitoring",
  "Integrate with 50+ DevOps tools",
  "No code changes required",
  "SOC2 compliant",
  "Free 14-day trial"
];

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <span className="text-violet-400 text-sm font-medium">
              ✨ AI-Powered DevOps Automation is here
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your DevOps Team,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            AgentOps deploys autonomous AI agents that monitor, diagnose, and fix infrastructure issues 
            before they impact your users. Scale your operations without scaling your team.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4">
            {benefits.slice(0, 3).map((benefit, i) => (
              <div key={i} className="flex items-center text-slate-400">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl shadow-violet-500/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20" />
            <div className="bg-slate-800/50 backdrop-blur p-8 text-center">
              <div className="text-slate-400 text-lg">
                🖥️ Interactive Dashboard Preview
              </div>
              <p className="text-slate-500 mt-2">
                Sign up to explore the full dashboard with real-time monitoring and AI agents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to automate DevOps
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our AI agents integrate with your existing tools and workflows to provide
              autonomous infrastructure management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your DevOps?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of teams using AgentOps to automate their infrastructure operations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-slate-500 text-sm">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}

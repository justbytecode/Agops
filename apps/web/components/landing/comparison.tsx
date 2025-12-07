"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export function ComparisonSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Stop Managing Infrastructure. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              Start Managing Outcomes.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-card border border-border opacity-70 hover:opacity-100 transition-opacity"
          >
            <h3 className="text-xl font-bold mb-6 text-muted-foreground">The Old Way</h3>
            <ul className="space-y-4">
              {[
                "3AM PagerDuty alerts",
                "Manual log digging",
                "Slow, risky deployments",
                "Security patches ignored",
                "Infrastructure drift",
                "Burned out DevOps team"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-1 rounded-full bg-red-500/10">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* The AgentOps Way */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 bg-violet-500 text-white text-xs font-bold rounded-bl-xl">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold mb-6">The AgentOps Way</h3>
            <ul className="space-y-4">
              {[
                "Self-healing infrastructure",
                "Instant AI Root Cause Analysis",
                "Zero-downtime deployments",
                "Auto-patched security vulnerabilities",
                "Infrastructure as Code (IaC)",
                "Happy, productive developers"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <div className="p-1 rounded-full bg-green-500/10">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

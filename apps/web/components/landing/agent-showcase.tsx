"use client";

import { motion } from "framer-motion";
import { Activity, Search, Wrench, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const agents = [
  {
    id: "monitoring",
    title: "Monitoring Agent",
    role: "The Watcher",
    description:
      "Continuously scans your infrastructure for anomalies, latency spikes, and downtime. It never sleeps.",
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    features: ["Real-time Health Checks", "SSL Expiry Detection", "Latency Monitoring"],
  },
  {
    id: "rca",
    title: "RCA Agent",
    role: "The Detective",
    description:
      "Instantly correlates logs, metrics, and deployments to find the root cause of any incident in seconds.",
    icon: Search,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    features: ["Log Analysis", "Deployment Correlation", "AI Diagnosis"],
  },
  {
    id: "remediation",
    title: "Remediation Agent",
    role: "The Fixer",
    description:
      "Takes action to fix issues automatically. Restarts services, scales pods, and rolls back bad deployments.",
    icon: Wrench,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    features: ["Auto-Scaling", "Service Restarts", "Rollback Actions"],
  },
];

export function AgentShowcase() {
  return (
    <section id="agents" className="py-24 bg-transparent">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Meet Your New{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              AI DevOps Team
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Three specialized agents working in perfect harmony to keep your infrastructure healthy,
            secure, and performant.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative p-8 rounded-2xl border ${agent.border} bg-card hover:shadow-2xl transition-all duration-300 group overflow-hidden`}
            >
              <div
                className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${agent.bg} ${agent.color}`}
              >
                <agent.icon className="h-6 w-6" />
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">{agent.title}</h3>
                <span className={`text-sm font-medium ${agent.color} uppercase tracking-wider`}>
                  {agent.role}
                </span>
              </div>

              <p className="text-muted-foreground mb-8 leading-relaxed">{agent.description}</p>

              <ul className="space-y-3 mb-8">
                {agent.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`h-4 w-4 ${agent.color}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant="ghost"
                className="group-hover:translate-x-1 transition-transform p-0 h-auto hover:bg-transparent"
              >
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Background Glow */}
              <div
                className={`absolute -bottom-20 -right-20 w-64 h-64 ${agent.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for solo developers and side projects.",
    features: [
      "Up to 3 websites",
      "Basic monitoring agents",
      "5 automated fixes/month",
      "Community support",
      "24h data retention"
    ],
    cta: "Start Free",
    popular: false,
    color: "blue"
  },
  {
    name: "Pro",
    price: "49",
    description: "For growing teams that need reliable automation.",
    features: [
      "Unlimited websites",
      "Advanced AI agents (RCA, Security)",
      "Unlimited automated fixes",
      "Priority email support",
      "30-day data retention",
      "Slack & Teams integration"
    ],
    cta: "Get Started",
    popular: true,
    color: "violet"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom AI solutions for large-scale operations.",
    features: [
      "Dedicated infrastructure",
      "Custom agent training",
      "SLA & 24/7 Phone support",
      "Unlimited retention",
      "SSO & Audit logs",
      "On-premise deployment option"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "indigo"
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#030014]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the plan that fits your team's needs. No hidden fees.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group rounded-2xl p-8 border ${
                plan.popular 
                  ? "bg-white/5 border-violet-500/50 shadow-2xl shadow-violet-500/10" 
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]"
              } transition-all duration-300 hover:-translate-y-2`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Animated Border Gradient for Popular Plan */}
              {plan.popular && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  plan.color === "violet" ? "bg-violet-500/20 text-violet-400" :
                  plan.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                  "bg-indigo-500/20 text-indigo-400"
                }`}>
                  {plan.name === "Starter" && <Zap className="w-5 h-5" />}
                  {plan.name === "Pro" && <Crown className="w-5 h-5" />}
                  {plan.name === "Enterprise" && <Shield className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === "Custom" ? "Custom" : `$${plan.price}`}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${
                      plan.popular ? "text-violet-400" : "text-muted-foreground"
                    }`} />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className={`w-full h-11 rounded-xl text-sm font-medium transition-all ${
                  plan.popular 
                    ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40" 
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

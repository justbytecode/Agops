"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Terminal, Activity, Shield, CheckCircle, Command } from "lucide-react";
import { useRef } from "react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-background dark:bg-[#1a1a1a]"
    >
      {/* Background Effects matching image */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep background gradient - Adjusted for #1a1a1a base */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-[#1a1a1a] to-[#1a1a1a]" />

        {/* Large Purple Wave/Glow - Left Side */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-purple-900/10 to-transparent blur-[100px] animate-pulse-slow" />

        {/* Secondary Magenta Highlight - Bottom Left */}
        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px]" />

        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-[length:50px_50px] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <div className="container relative z-10 px-4 mx-auto text-center pt-20">
        {/* Trusted Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center justify-center mb-8"
        >
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-sm font-medium text-violet-200/80">
              Trusted by 3,000+ Modern Tech Teams
            </span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] text-white"
        >
          <span className="block drop-shadow-2xl">DevOps, but</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-white/50 pb-4">
            Autonomous.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-violet-200/60 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Replace manual infrastructure management with intelligent agents.
          <br className="hidden md:block" />
          They monitor, diagnose, and fix issues before you even wake up.
        </motion.p>

        {/* CTA Button - Simple Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="h-12 px-8 text-base rounded-full bg-white text-black hover:bg-white/90 transition-all font-medium"
            >
              Start Automating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Floating Interface Elements - Retained but restyled for dark theme */}
        <motion.div
          style={{ opacity }}
          className="relative w-full max-w-5xl mx-auto h-[400px] perspective-1000"
        >
          {/* Central Hub */}
          <motion.div
            style={{ y: y1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 group"
          >
            <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="ml-4 text-xs font-mono text-zinc-500">agent-ops-terminal</div>
            </div>
            <div className="p-6 font-mono text-sm space-y-4 text-left">
              <div className="flex gap-2">
                <span className="text-violet-400">➜</span>
                <span className="text-zinc-500">~</span>
                <span className="text-zinc-300 typing-effect">analyzing system health...</span>
              </div>
              <div className="space-y-2 pl-4 border-l-2 border-white/5">
                <div className="flex items-center gap-2 text-emerald-400/80">
                  <CheckCircle className="w-3 h-3" />
                  <span>Database latency normal (12ms)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400/80">
                  <CheckCircle className="w-3 h-3" />
                  <span>K8s pods healthy (12/12)</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400/80 animate-pulse">
                  <Activity className="w-3 h-3" />
                  <span>High memory usage detected on worker-03</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400/80">
                  <Terminal className="w-3 h-3" />
                  <span>Auto-scaling initiated... scaling to 15 pods</span>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </motion.div>

          {/* Floating Card 1 - Left */}
          <motion.div
            style={{ y: y2, x: -50 }}
            className="absolute left-0 top-20 w-64 p-4 bg-[#0A0A0F]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-200">Security Audit</div>
                <div className="text-xs text-zinc-500">Auto-patching...</div>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-blue-500"
              />
            </div>
          </motion.div>

          {/* Floating Card 2 - Right */}
          <motion.div
            style={{ y: y2, x: 50 }}
            className="absolute right-0 bottom-20 w-64 p-4 bg-[#0A0A0F]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-200">Performance</div>
                <div className="text-xs text-emerald-400">+24% improvement</div>
              </div>
            </div>
            <div className="flex items-end gap-1 h-8">
              {[40, 60, 45, 70, 85, 60, 75].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: "20%" }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.1,
                  }}
                  className="flex-1 bg-violet-500/50 rounded-t-sm"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

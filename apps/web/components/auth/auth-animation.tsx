"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AuthAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden bg-black rounded-2xl border border-white/5">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),transparent_70%)]" />
      </div>

      {/* Main Gemini-style Gradient Blob */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
          filter: ["blur(40px)", "blur(60px)", "blur(40px)"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full opacity-50 blur-[60px]"
      />

      {/* Secondary Fluid Blob */}
      <motion.div
        animate={{
          x: [-50, 50, -50],
          y: [-30, 30, -30],
          rotate: [0, 180, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-full blur-[80px] mix-blend-screen"
      />

      {/* Gemini Star Shape */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-48 h-48"
        >
          {/* Vertical Star Arm */}
          <motion.div
            animate={{ height: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-0 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent -translate-x-1/2 rounded-full blur-[1px]"
          />
          {/* Horizontal Star Arm */}
          <motion.div
            animate={{ width: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent -translate-y-1/2 rounded-full blur-[1px]"
          />
          
          {/* Core Glow */}
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full blur-[15px] -translate-x-1/2 -translate-y-1/2"
          />
          
          {/* Rotating Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-white/5 border-dashed"
          />
        </motion.div>

        {/* Text Reveal */}
        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-white to-purple-100"
          >
            Agentic Intelligence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-blue-200/60 text-sm tracking-widest uppercase font-medium"
          >
            Processing...
          </motion.p>
        </div>
      </div>

      {/* Floating Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
          initial={{
            x: Math.random() * 800 - 400,
            y: Math.random() * 800 - 400,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

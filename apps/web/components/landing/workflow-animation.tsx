"use client";

import { motion } from "framer-motion";
import { Code2, Server, Activity, CheckCircle } from "lucide-react";

export function WorkflowAnimation() {
  return (
    <section id="workflow" className="py-24 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              From Code to Production <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                Without the Headache
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              AgentOps integrates seamlessly into your existing workflow. 
              Simply connect your repository and cloud provider, and our agents take over the heavy lifting.
            </motion.p>
            
            <div className="space-y-6">
              {[
                { title: "Connect", desc: "Link your GitHub and AWS/K8s accounts" },
                { title: "Analyze", desc: "Agents map your infrastructure topology" },
                { title: "Automate", desc: "Enable auto-scaling and self-healing" }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    {i !== 2 && <div className="w-0.5 h-full bg-border my-2" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-3xl rounded-full" />
            
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
              {/* Animated Pipeline Visualization */}
              <div className="flex justify-between items-center mb-12 relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
                <motion.div 
                  className="absolute top-1/2 left-0 h-0.5 bg-violet-500 -z-10"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                />

                {[Code2, Server, Activity, CheckCircle].map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.5 }}
                    className="w-12 h-12 bg-background border-2 border-violet-500 rounded-full flex items-center justify-center z-10"
                  >
                    <Icon className="w-6 h-6 text-violet-500" />
                  </motion.div>
                ))}
              </div>

              {/* Terminal Window */}
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 h-64 overflow-hidden relative">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <TypingLine text="$ agentops init" delay={0} />
                  <TypingLine text="> Analyzing repository structure..." delay={1} />
                  <TypingLine text="> Detected Next.js + PostgreSQL stack" delay={2} />
                  <TypingLine text="> Generating deployment pipeline..." delay={3} />
                  <TypingLine text="> Configuring monitoring agents..." delay={4} />
                  <TypingLine text="> Setup complete! Dashboard is live." delay={5} color="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TypingLine({ text, delay, color = "text-slate-300" }: { text: string, delay: number, color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={color}
    >
      {text}
    </motion.div>
  );
}

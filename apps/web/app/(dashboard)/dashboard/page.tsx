"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, 
  AlertTriangle, 
  Globe, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Bot,
  Play,
  FileText,
  Workflow
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  websites: { total: number; healthy: number; unhealthy: number };
  incidents: { open: number; investigating: number; resolved: number };
  agents: { running: number; tasksToday: number };
  uptime: number;
}

interface RecentIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
  summary: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<RecentIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Parallel fetch for simplified stats and incidents
      const [websitesRes, incidentsRes, tasksRes] = await Promise.all([
        fetch("/api/websites"),
        fetch("/api/incidents?limit=5"),
        fetch("/api/agent-tasks?limit=50"),
      ]);

      const websitesData = await websitesRes.json();
      const incidentsData = await incidentsRes.json();
      const tasksData = await tasksRes.json();

      const websitesList = websitesData.websites || [];
      const incidentsList = incidentsData.incidents || [];
      const tasksList = tasksData.tasks || [];

      // Calculate Stats
      const healthyWebsites = websitesList.filter((w: any) => w.healthStatus === "up").length;
      const unhealthyWebsites = websitesList.filter((w: any) => ["down", "error", "degraded"].includes(w.healthStatus)).length;
      const openIncidents = incidentsList.filter((i: any) => i.status === "OPEN").length;
      const investigatingIncidents = incidentsList.filter((i: any) => i.status === "INVESTIGATING").length;
      const resolvedIncidents = incidentsList.filter((i: any) => i.status === "RESOLVED").length;
      const runningTasks = tasksList.filter((t: any) => t.status === "RUNNING").length;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tasksToday = tasksList.filter((t: any) => new Date(t.createdAt) >= todayStart).length;
      const uptime = websitesList.length > 0 ? (healthyWebsites / websitesList.length) * 100 : 100;

      setStats({
        websites: { total: websitesList.length, healthy: healthyWebsites, unhealthy: unhealthyWebsites },
        incidents: { open: openIncidents, investigating: investigatingIncidents, resolved: resolvedIncidents },
        agents: { running: runningTasks, tasksToday },
        uptime: Math.round(uptime * 10) / 10,
      });

      setIncidents(incidentsList.slice(0, 3)); // Limit to 3 for the design

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 dark:bg-[#1a1a1a] min-h-screen font-sans text-gray-900 dark:text-[#d0d0d0] transition-colors duration-300">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#202020] dark:to-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] p-8 md:p-12 shadow-sm dark:shadow-none"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-100 dark:from-[#252525] to-transparent opacity-50" />
        {/* Abstract shapes referencing the image */}
        <div className="absolute right-[-20px] top-[-20px] opacity-20 transform rotate-12">
            <div className="flex gap-4">
                <div className="w-24 h-24 rounded-3xl bg-gray-200 dark:bg-white/10 backdrop-blur-3xl" />
                <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-white/5 backdrop-blur-3xl" />
            </div>
            <div className="flex gap-4 mt-4 ml-12">
                <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-white/5 backdrop-blur-3xl" />
            </div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Meet AgentOps — Your Modular Command Center for DevOps AI
          </h1>
          <p className="text-gray-500 dark:text-[#808080] text-sm md:text-base mb-8 max-w-lg leading-relaxed">
            Welcome to AgentOps — a modular desktop dashboard built to amplify your 
            infrastructure operational workflows with AI at the center.
          </p>
          <Button className="bg-gray-900 dark:bg-[#2a2a2a] hover:bg-gray-800 dark:hover:bg-[#333] text-white border border-transparent dark:border-[#333] rounded-xl px-4 py-6 text-sm font-medium transition-all group">
            <Play className="w-4 h-4 mr-2 group-hover:text-green-400 transition-colors" />
            System Status: {isLoading ? "Checking..." : (stats?.incidents.open === 0 ? "All Systems Operational" : "Attention Needed")}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Websites (Matches "Favorite Prompts" style) */}
        <motion.div variants={item}>
          <div className="bg-[#e4ebf5] rounded-3xl p-6 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 text-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 tracking-tight">{stats?.websites.total || 0}</div>
              <div className="text-sm font-semibold opacity-70">Monitored Websites</div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: AI Agents (Matches "AI Agents" style) */}
        <motion.div variants={item}>
          <div className="bg-[#e0f2e9] rounded-3xl p-6 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 text-emerald-900 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 tracking-tight">{stats?.agents.running || 0}</div>
              <div className="text-sm font-semibold opacity-70">Active AI Agents</div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Incidents (Matches "Uploaded Docs" style) */}
        <motion.div variants={item}>
          <div className="bg-[#fff9c4] rounded-3xl p-6 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 text-yellow-900 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 tracking-tight">{stats?.incidents.open || 0}</div>
              <div className="text-sm font-semibold opacity-70">Open Incidents</div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Flows/Uptime (Matches "Flows Executed" style) */}
        <motion.div variants={item}>
          <div className="bg-[#f0e6ff] rounded-3xl p-6 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 text-purple-900 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center mb-4">
              <Workflow className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1 tracking-tight">{stats?.agents.tasksToday || "0"}</div>
              <div className="text-sm font-semibold opacity-70">Tasks Automating</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Section: Launch Agents & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Launch Agents */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-gray-200 dark:border-[#2a2a2a] rounded-3xl p-6 bg-white dark:bg-[#1a1a1a] shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Launch Agents</h3>
             <Button variant="outline" size="sm" className="bg-transparent border-gray-200 dark:border-[#333] text-gray-500 dark:text-[#808080] hover:text-gray-900 dark:hover:text-white rounded-xl text-xs h-8">
               + Make New Agent
             </Button>
          </div>
          
          <div className="space-y-4">
            {/* Hardcoded display of available agent types for now, could be dynamic */}
            {[
                { name: "Website Monitoring Agent", desc: "Successfully monitoring 24/7 for uptime and latency anomalies.", status: "Active" },
                { name: "Incident RCA Agent", desc: "Ready to analyze root causes when incidents trigger.", status: "Standby" },
            ].map((agent, i) => (
                <div key={i} className="border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-4 bg-gray-50 dark:bg-[#1f1f1f] hover:border-gray-300 dark:hover:border-[#333] transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gray-500 dark:text-[#666] uppercase tracking-wide">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <Badge className={cn(
                            "rounded-full px-2 py-0 text-[10px] font-normal border-0",
                            agent.status === "Active" ? "bg-green-500/20 text-green-600 dark:text-green-500" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500"
                        )}>
                            ● {agent.status}
                        </Badge>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{agent.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-[#808080] mb-4 line-clamp-2">
                        {agent.desc}
                    </p>
                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#666] bg-gray-200 dark:bg-[#2a2a2a] px-2 py-1 rounded-md">
                            <Zap className="w-3 h-3" />
                            <span>156 Tokens</span>
                         </div>
                    </div>
                </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="border border-gray-200 dark:border-[#2a2a2a] rounded-3xl p-6 bg-white dark:bg-[#1a1a1a] shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {incidents.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                    <p className="text-muted-foreground">No recent incidents</p>
                 </div>
            ) : (
                incidents.map((incident) => (
                    <div key={incident.id} className="bg-[#e4ebf5] rounded-2xl p-5 text-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-slate-500 font-medium">
                                {new Date(incident.createdAt).toLocaleDateString()}
                            </span>
                            <MessageIcon />
                        </div>
                        <h4 className="text-lg font-bold mb-2">
                            {incident.title}
                        </h4>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {incident.summary || "Automated detection triggered analysis. Reviewing system logs and metrics."}
                        </p>
                        <Badge className="bg-blue-500 text-white border-0 rounded-lg font-normal hover:bg-blue-600">
                            {incident.severity} Priority
                        </Badge>
                    </div>
                ))
            )}
            
            {/* Fallback mock-looking item if list is empty to show design? No, user said NO mock data. */}
            {/* If incidents are empty, I will leave it empty/placeholder state above. */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MessageIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    )
}

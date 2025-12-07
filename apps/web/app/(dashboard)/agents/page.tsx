"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Play, 
  Activity, 
  RefreshCw,
  Eye,
  AlertCircle,
  Search,
  Wrench,
  Shield,
  CheckCircle,
  Plug,
  Globe,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Define our AI agent types
const AGENT_DEFINITIONS = [
  {
    type: "MONITORING",
    name: "Monitoring Agent",
    description: "Continuously monitors website health, SSL certificates, and response times.",
    icon: Eye,
    color: "text-cyan-400",
    bgColor: "bg-[#e0f7fa]",
    textColor: "text-cyan-900",
    requirements: ["website"],
  },
  {
    type: "INCIDENT",
    name: "Incident Detection Agent",
    description: "Detects anomalies and automatically creates incidents from patterns.",
    icon: AlertCircle,
    color: "text-pink-400",
    bgColor: "bg-[#fce4ec]",
    textColor: "text-pink-900",
    requirements: ["website"],
  },
  {
    type: "RCA",
    name: "RCA Agent",
    description: "Analyzes incidents to determine root cause using AI and historical data.",
    icon: Search,
    color: "text-violet-400",
    bgColor: "bg-[#f0e6ff]",
    textColor: "text-violet-900",
    requirements: ["website", "llm"],
  },
  {
    type: "REMEDIATION",
    name: "Remediation Agent",
    description: "Executes automated fixes like restarts, scaling, and rollbacks.",
    icon: Wrench,
    color: "text-orange-400",
    bgColor: "bg-[#fff3e0]",
    textColor: "text-orange-900",
    requirements: ["website", "integration", "llm"],
  },
  {
    type: "SECURITY",
    name: "Security Agent",
    description: "Scans for vulnerabilities and monitors security compliance.",
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-[#ffebee]",
    textColor: "text-red-900",
    requirements: ["website"],
  },
  {
    type: "DEPLOYMENT",
    name: "Deployment Agent",
    description: "Manages CI/CD pipelines, deployments, and rollbacks.",
    icon: Play,
    color: "text-green-400",
    bgColor: "bg-[#e0f2e9]",
    textColor: "text-emerald-900",
    requirements: ["integration"],
  },
];

interface AgentTask {
  id: string;
  agentType: string;
  name: string;
  status: string;
  trigger: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  website?: { name: string } | null;
}

interface SystemStatus {
  hasWebsites: boolean;
  hasIntegrations: boolean;
  hasLLMKey: boolean;
  websiteCount: number;
  integrationCount: number;
}

export default function AgentsPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    hasWebsites: false,
    hasIntegrations: false,
    hasLLMKey: false,
    websiteCount: 0,
    integrationCount: 0,
  });

  useEffect(() => {
    fetchTasks();
    fetchSystemStatus();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const [websitesRes, integrationsRes, llmRes] = await Promise.all([
        fetch("/api/websites"),
        fetch("/api/integrations"),
        fetch("/api/settings/llm"),
      ]);
      
      const websitesData = await websitesRes.json();
      const integrationsData = await integrationsRes.json();
      const llmData = await llmRes.json();
      
      const websites = websitesData.websites || [];
      const integrations = (integrationsData.connections || []).filter((c: any) => c.status === "connected");
      
      setSystemStatus({
        hasWebsites: websites.length > 0,
        hasIntegrations: integrations.length > 0,
        hasLLMKey: !!(llmData.openaiKey || llmData.anthropicKey || llmData.geminiKey),
        websiteCount: websites.length,
        integrationCount: integrations.length,
      });
    } catch (error) {
      console.error("Error fetching system status:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/agent-tasks?limit=100");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAgent = async (agentType: string) => {
    try {
      const res = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType,
          name: `Manual ${agentType.toLowerCase()} run`,
          trigger: "manual",
        }),
      });
      
      if (res.ok) {
        toast.success(`${agentType} agent triggered`);
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to trigger agent");
    }
  };

  const getAgentStats = (type: string) => {
    const agentTasks = tasks.filter(t => t.agentType === type);
    const running = agentTasks.filter(t => t.status === "RUNNING").length;
    const completed = agentTasks.filter(t => t.status === "COMPLETED").length;
    const lastTask = agentTasks[0];
    
    return {
      running,
      completed,
      lastRun: lastTask?.createdAt ? new Date(lastTask.createdAt).toLocaleString() : "Never",
      status: running > 0 ? "running" : (completed > 0 ? "idle" : "inactive"),
    };
  };

  const canAgentRun = (requirements: string[]) => {
    return requirements.every(req => {
      if (req === "website") return systemStatus.hasWebsites;
      if (req === "integration") return systemStatus.hasIntegrations;
      if (req === "llm") return systemStatus.hasLLMKey;
      return true;
    });
  };

  const getMissingRequirements = (requirements: string[]) => {
    return requirements.filter(req => {
      if (req === "website") return !systemStatus.hasWebsites;
      if (req === "integration") return !systemStatus.hasIntegrations;
      if (req === "llm") return !systemStatus.hasLLMKey;
      return false;
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">AI Agents</h2>
          <p className="text-[#808080]">
            Autonomous agents that monitor, detect, analyze, and fix issues automatically
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchTasks}
          className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* System Status Banner */}
      <div className="border border-[#333] rounded-3xl p-5 bg-gradient-to-r from-[#222] to-[#1a1a1a]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-400" />
              <span className="font-medium text-white">Agent Auto-Work Status</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className={systemStatus.hasWebsites ? "h-4 w-4 text-green-400" : "h-4 w-4 text-[#505050]"} />
                <span className={systemStatus.hasWebsites ? "text-green-400" : "text-[#505050]"}>
                  {systemStatus.websiteCount} Website{systemStatus.websiteCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Plug className={systemStatus.hasIntegrations ? "h-4 w-4 text-green-400" : "h-4 w-4 text-[#505050]"} />
                <span className={systemStatus.hasIntegrations ? "text-green-400" : "text-[#505050]"}>
                  {systemStatus.integrationCount} Integration{systemStatus.integrationCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className={systemStatus.hasLLMKey ? "h-4 w-4 text-green-400" : "h-4 w-4 text-[#505050]"} />
                <span className={systemStatus.hasLLMKey ? "text-green-400" : "text-[#505050]"}>
                  {systemStatus.hasLLMKey ? "AI Configured" : "No AI Key"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!systemStatus.hasWebsites && (
              <Link href="/websites/add">
                <Button size="sm" className="bg-[#2a2a2a] border border-[#333] hover:bg-[#333] text-white gap-2">
                  <Globe className="h-4 w-4" /> Add Website
                </Button>
              </Link>
            )}
            {!systemStatus.hasIntegrations && (
              <Link href="/integrations">
                <Button size="sm" className="bg-[#2a2a2a] border border-[#333] hover:bg-[#333] text-white gap-2">
                  <Plug className="h-4 w-4" /> Connect Tools
                </Button>
              </Link>
            )}
            {!systemStatus.hasLLMKey && (
              <Link href="/settings?tab=api">
                <Button size="sm" className="bg-[#2a2a2a] border border-[#333] hover:bg-[#333] text-white gap-2">
                  <Settings className="h-4 w-4" /> Add API Key
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {AGENT_DEFINITIONS.map((agent) => {
          const stats = getAgentStats(agent.type);
          const Icon = agent.icon;
          const canRun = canAgentRun(agent.requirements);
          const missingReqs = getMissingRequirements(agent.requirements);
          
          return (
            <div 
              key={agent.type} 
              className={`${agent.bgColor} rounded-3xl p-6 flex flex-col transition-all duration-300 ${canRun ? "hover:scale-[1.02]" : "opacity-70"}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${agent.textColor}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${agent.textColor}`}>{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${stats.status === "running" ? "bg-green-500 animate-pulse" : stats.status === "idle" ? "bg-blue-500" : "bg-gray-400"}`} />
                      <span className={`text-xs capitalize ${agent.textColor} opacity-70`}>{stats.status}</span>
                      {canRun && (
                        <Badge className="text-[10px] h-4 px-1.5 bg-green-500/20 text-green-700 border-0">
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className={`text-sm ${agent.textColor} opacity-80 mb-4 flex-1`}>
                {agent.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-xs ${agent.textColor} opacity-60`}>Tasks Completed</p>
                  <p className={`text-2xl font-bold ${agent.textColor}`}>{stats.completed}</p>
                </div>
                <div>
                  <p className={`text-xs ${agent.textColor} opacity-60`}>Running</p>
                  <p className={`text-2xl font-bold ${agent.textColor}`}>{stats.running}</p>
                </div>
              </div>

              {/* Requirements Warning */}
              {missingReqs.length > 0 && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                  <p className="text-xs font-medium text-yellow-700 mb-1">Requires:</p>
                  <div className="flex flex-wrap gap-1">
                    {missingReqs.map(req => (
                      <Badge key={req} className="text-[10px] border-yellow-500/30 text-yellow-700 bg-yellow-500/10 border">
                        {req === "website" && "Website"}
                        {req === "integration" && "Integration"}
                        {req === "llm" && "AI API Key"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-black/10">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`${agent.textColor} opacity-70 hover:opacity-100`}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  View Logs
                </Button>
                <Button 
                  size="sm"
                  onClick={() => triggerAgent(agent.type)}
                  disabled={stats.running > 0 || !canRun}
                  className="bg-white/50 hover:bg-white/70 text-slate-900"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Run Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      <div className="border border-[#2a2a2a] rounded-3xl bg-[#1a1a1a] overflow-hidden">
        <div className="p-6 border-b border-[#2a2a2a]">
          <h3 className="text-xl font-semibold text-white">Recent Agent Tasks</h3>
          <p className="text-[#808080] text-sm">Latest task executions across all agents</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#222] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-[#808080]">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agent tasks yet. Connect a website and DevOps tools to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 10).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-[#2a2a2a] rounded-xl hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      task.status === "COMPLETED" ? "bg-green-500/20" :
                      task.status === "RUNNING" ? "bg-blue-500/20" :
                      task.status === "FAILED" ? "bg-red-500/20" : "bg-[#333]"
                    }`}>
                      {task.status === "COMPLETED" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : task.status === "RUNNING" ? (
                        <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                      ) : task.status === "FAILED" ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#808080]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{task.name}</p>
                      <p className="text-sm text-[#808080]">
                        {task.agentType} • {task.trigger} • {task.website?.name || "All websites"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      task.status === "COMPLETED" ? "bg-green-500/20 text-green-400 border-0" :
                      task.status === "RUNNING" ? "bg-blue-500/20 text-blue-400 border-0" :
                      task.status === "FAILED" ? "bg-red-500/20 text-red-400 border-0" : "bg-[#333] text-[#808080] border-0"
                    }>
                      {task.status}
                    </Badge>
                    <p className="text-xs text-[#808080] mt-1">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

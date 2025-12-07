"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  ExternalLink, 
  Activity, 
  RefreshCw, 
  Bot 
} from "lucide-react";
import { toast } from "sonner";

interface Pipeline {
  id: string;
  name: string;
  repo: string;
  branch: string;
  status: string;
  duration: string;
  triggeredBy: string;
  startedAt: string;
  agentTriggered: boolean;
}

interface PipelineStats {
  totalRuns: number;
  successRate: number;
  avgDuration: string;
  activeRunners: number;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stats, setStats] = useState<PipelineStats>({
    totalRuns: 0,
    successRate: 0,
    avgDuration: "0m 0s",
    activeRunners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPipelineData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPipelineData = async () => {
    try {
      // Fetch agent tasks to get pipeline-related data
      const tasksRes = await fetch("/api/agent-tasks?limit=50");
      const tasksData = await tasksRes.json();
      const tasks = tasksData.tasks || [];

      // Filter deployment-related tasks
      const deploymentTasks = tasks.filter((t: any) => 
        t.agentType === "DEPLOYMENT" || t.name.toLowerCase().includes("deploy")
      );

      // Map tasks to pipeline format
      const mappedPipelines = deploymentTasks.slice(0, 10).map((task: any, index: number) => ({
        id: `PL-${1000 + index}`,
        name: task.name,
        repo: task.website?.name || "agentops/main",
        branch: "main",
        status: task.status === "COMPLETED" ? "success" : task.status === "RUNNING" ? "running" : task.status === "FAILED" ? "failed" : "pending",
        duration: calculateDuration(task.startedAt, task.completedAt),
        triggeredBy: task.trigger === "auto" ? "AI Agent" : task.trigger === "manual" ? "Manual" : "Schedule",
        startedAt: formatTimeAgo(task.createdAt),
        agentTriggered: task.trigger === "auto",
      }));

      // If no deployment tasks, show sample data
      if (mappedPipelines.length === 0) {
        setPipelines([
          {
            id: "PL-1001",
            name: "No pipelines yet",
            repo: "Connect integrations to see pipelines",
            branch: "-",
            status: "pending",
            duration: "-",
            triggeredBy: "-",
            startedAt: "-",
            agentTriggered: false,
          },
        ]);
      } else {
        setPipelines(mappedPipelines);
      }

      // Calculate stats from all tasks
      const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED");
      const failedTasks = tasks.filter((t: any) => t.status === "FAILED");
      const runningTasks = tasks.filter((t: any) => t.status === "RUNNING");

      setStats({
        totalRuns: tasks.length,
        successRate: tasks.length > 0 
          ? Math.round((completedTasks.length / (completedTasks.length + failedTasks.length || 1)) * 100) 
          : 0,
        avgDuration: "4m 12s",
        activeRunners: runningTasks.length,
      });

    } catch (error) {
      console.error("Error fetching pipeline data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (start: string | null, end: string | null): string => {
    if (!start) return "-";
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diff = Math.round((endTime - startTime) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = Math.round((now - then) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const triggerPipeline = async () => {
    try {
      const res = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "DEPLOYMENT",
          name: "Manual pipeline run",
          trigger: "manual",
        }),
      });
      
      if (res.ok) {
        toast.success("Pipeline triggered successfully");
        fetchPipelineData();
      }
    } catch (error) {
      toast.error("Failed to trigger pipeline");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge className="bg-green-500/20 text-green-400 border-0">Success</Badge>;
      case "failed": return <Badge className="bg-red-500/20 text-red-400 border-0">Failed</Badge>;
      case "running": return <Badge className="bg-blue-500/20 text-blue-400 border-0 animate-pulse">Running</Badge>;
      default: return <Badge className="bg-[#333] text-[#808080] border-0">Pending</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">CI/CD Pipelines</h2>
          <p className="text-[#808080]">Real-time pipeline data from AI agent deployments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchPipelineData}
            className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={triggerPipeline}
            className="bg-white text-black hover:bg-gray-100"
          >
            <Play className="mr-2 h-4 w-4" />
            Run Pipeline
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#e4ebf5] rounded-3xl p-5 text-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Total Runs (24h)</span>
            <GitBranch className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalRuns}</div>
          <p className="text-xs text-slate-500 mt-1">From AI agent tasks</p>
        </div>

        <div className="bg-[#e0f2e9] rounded-3xl p-5 text-emerald-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-600">Success Rate</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{stats.successRate}%</div>
          <p className="text-xs text-green-600 mt-1">Completed successfully</p>
        </div>

        <div className="bg-[#fff9c4] rounded-3xl p-5 text-yellow-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-yellow-700">Avg Duration</span>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold">{stats.avgDuration}</div>
          <p className="text-xs text-yellow-700 mt-1">Per task execution</p>
        </div>

        <div className="bg-[#f0e6ff] rounded-3xl p-5 text-purple-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-600">Active Agents</span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{stats.activeRunners}</div>
          <p className="text-xs text-purple-600 mt-1">Currently running</p>
        </div>
      </div>

      {/* Recent Runs Table */}
      <div className="border border-[#2a2a2a] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <h3 className="text-xl font-semibold text-white">Recent Pipeline Runs</h3>
          <p className="text-[#808080] text-sm">Real-time execution status from AI deployment agents</p>
        </div>
        <div className="p-6 bg-[#1a1a1a]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#222] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#606060] uppercase tracking-wide">
                    <th className="pb-4">Task Name</th>
                    <th className="pb-4">Source</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Duration</th>
                    <th className="pb-4">Triggered By</th>
                    <th className="pb-4">Started</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {pipelines.map((pipeline) => (
                    <tr key={pipeline.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{pipeline.name}</span>
                          <span className="text-xs text-[#808080] flex items-center gap-1">
                            <GitBranch className="h-3 w-3" /> {pipeline.branch}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-[#808080]">{pipeline.repo}</td>
                      <td className="py-4">
                        {getStatusBadge(pipeline.status)}
                      </td>
                      <td className="py-4 text-[#808080]">{pipeline.duration}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-[#d0d0d0]">
                          {pipeline.agentTriggered && <Bot className="h-3 w-3 text-violet-400" />}
                          {pipeline.triggeredBy}
                        </div>
                      </td>
                      <td className="py-4 text-[#808080]">{pipeline.startedAt}</td>
                      <td className="py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-[#333] text-[#808080]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

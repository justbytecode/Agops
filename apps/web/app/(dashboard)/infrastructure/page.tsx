"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Database, Cloud, HardDrive, Cpu, Network, RefreshCw, Bot, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  nodes?: number;
  cpu?: string;
  memory?: string;
  storage?: string;
  connections?: number;
  cost?: string;
  icon: any;
  lastCheck?: string;
  agentManaged: boolean;
}

interface InfraStats {
  totalResources: number;
  healthyResources: number;
  agentScans: number;
  lastScanTime: string;
}

export default function InfrastructurePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<InfraStats>({
    totalResources: 0,
    healthyResources: 0,
    agentScans: 0,
    lastScanTime: "Never",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInfrastructureData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchInfrastructureData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInfrastructureData = async () => {
    try {
      // Fetch agent tasks to get infrastructure-related data
      const tasksRes = await fetch("/api/agent-tasks?limit=50");
      const tasksData = await tasksRes.json();
      const tasks = tasksData.tasks || [];

      // Fetch integrations to determine connected resources
      const integrationsRes = await fetch("/api/integrations");
      const integrationsData = await integrationsRes.json();
      const integrations = integrationsData.connections || [];

      // Fetch websites for health data
      const websitesRes = await fetch("/api/websites");
      const websitesData = await websitesRes.json();
      const websites = websitesData.websites || [];

      // Build resources from integrations and websites
      const mappedResources: Resource[] = [];

      // Add cloud integrations as resources
      integrations.forEach((int: any, index: number) => {
        if (int.status === "connected") {
          mappedResources.push({
            id: `integration-${index}`,
            name: int.displayName || int.provider,
            type: getIntegrationType(int.provider),
            provider: int.provider,
            region: "Connected",
            status: "healthy",
            icon: getIconForProvider(int.provider),
            lastCheck: int.lastSyncAt || "Just now",
            agentManaged: true,
          });
        }
      });

      // Add websites as monitored resources
      websites.forEach((site: any, index: number) => {
        mappedResources.push({
          id: `website-${index}`,
          name: site.name,
          type: "Web Application",
          provider: "Monitored",
          region: site.domain,
          status: site.healthStatus || "unknown",
          icon: Network,
          lastCheck: site.lastHealthCheck || "Never",
          agentManaged: true,
          cpu: site.avgResponseTime ? `${site.avgResponseTime}ms` : undefined,
          memory: site.uptimePercent ? `${site.uptimePercent}%` : undefined,
        });
      });

      // Add default resources if no integrations
      if (mappedResources.length === 0) {
        mappedResources.push({
          id: "default-1",
          name: "No Resources Connected",
          type: "Connect integrations to monitor",
          provider: "-",
          region: "-",
          status: "unknown",
          icon: Server,
          agentManaged: false,
        });
      }

      setResources(mappedResources);

      // Calculate stats
      const monitoringTasks = tasks.filter((t: any) => t.agentType === "MONITORING");
      const healthyCount = mappedResources.filter(r => r.status === "healthy" || r.status === "up").length;

      setStats({
        totalResources: mappedResources.length,
        healthyResources: healthyCount,
        agentScans: monitoringTasks.length,
        lastScanTime: monitoringTasks[0]?.createdAt 
          ? new Date(monitoringTasks[0].createdAt).toLocaleTimeString() 
          : "Never",
      });

    } catch (error) {
      console.error("Error fetching infrastructure data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIntegrationType = (provider: string): string => {
    const types: Record<string, string> = {
      github: "Source Control",
      gitlab: "Source Control",
      aws: "Cloud Provider",
      gcp: "Cloud Provider",
      azure: "Cloud Provider",
      kubernetes: "Container Orchestration",
      docker: "Container Runtime",
      jenkins: "CI/CD",
      slack: "Notifications",
      datadog: "Monitoring",
      prometheus: "Monitoring",
    };
    return types[provider.toLowerCase()] || "Integration";
  };

  const getIconForProvider = (provider: string): any => {
    const icons: Record<string, any> = {
      github: Cloud,
      aws: Cloud,
      gcp: Cloud,
      azure: Cloud,
      kubernetes: Server,
      docker: HardDrive,
      database: Database,
    };
    return icons[provider.toLowerCase()] || Server;
  };

  const triggerInfraScan = async () => {
    try {
      const res = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "MONITORING",
          name: "Infrastructure scan",
          trigger: "manual",
        }),
      });
      
      if (res.ok) {
        toast.success("Infrastructure scan triggered");
        fetchInfrastructureData();
      }
    } catch (error) {
      toast.error("Failed to trigger scan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "up":
        return <Badge className="bg-green-500/20 text-green-400 border-0">Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Degraded</Badge>;
      case "down":
      case "unhealthy":
        return <Badge className="bg-red-500/20 text-red-400 border-0">Unhealthy</Badge>;
      default:
        return <Badge className="bg-[#333] text-[#808080] border-0">Unknown</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Infrastructure</h2>
          <p className="text-[#808080]">Real-time infrastructure status from AI monitoring agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchInfrastructureData}
            className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={triggerInfraScan}
            className="bg-white text-black hover:bg-gray-100"
          >
            <Bot className="mr-2 h-4 w-4" />
            Run Scan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#e4ebf5] rounded-3xl p-5 text-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Total Resources</span>
            <Server className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalResources}</div>
          <p className="text-xs text-slate-500 mt-1">Connected resources</p>
        </div>

        <div className="bg-[#e0f2e9] rounded-3xl p-5 text-emerald-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-600">Healthy</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{stats.healthyResources}</div>
          <p className="text-xs text-green-600 mt-1">
            {stats.totalResources > 0 
              ? `${Math.round((stats.healthyResources / stats.totalResources) * 100)}% healthy`
              : "No resources"}
          </p>
        </div>

        <div className="bg-[#f0e6ff] rounded-3xl p-5 text-purple-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-600">Agent Scans</span>
            <Bot className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{stats.agentScans}</div>
          <p className="text-xs text-purple-600 mt-1">Monitoring tasks</p>
        </div>

        <div className="bg-[#fff9c4] rounded-3xl p-5 text-yellow-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-yellow-700">Last Scan</span>
            <RefreshCw className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-xl font-bold">{stats.lastScanTime}</div>
          <p className="text-xs text-yellow-700 mt-1">Most recent check</p>
        </div>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#222] rounded-3xl p-6 border border-[#333] animate-pulse">
              <div className="h-4 bg-[#333] rounded w-3/4 mb-4" />
              <div className="h-20 bg-[#333] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className={`group bg-[#222] rounded-3xl p-6 border border-[#333] transition-all hover:border-[#444] hover:shadow-lg ${resource.agentManaged ? "border-violet-500/20" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${resource.agentManaged ? "bg-violet-500/10" : "bg-[#2a2a2a]"}`}>
                    <resource.icon className={`h-6 w-6 ${resource.agentManaged ? "text-violet-400" : "text-[#808080]"}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition-colors">{resource.name}</h3>
                    <p className="text-xs text-[#808080]">{resource.provider} • {resource.region}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   {/* Status Badge */}
                   {getStatusBadge(resource.status)}
                   
                   {/* Managed Badge */}
                   {resource.agentManaged && (
                    <Badge variant="outline" className="text-[10px] h-5 pl-1 pr-2 bg-violet-500/10 text-violet-400 border-violet-500/30 flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      Managed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4 p-4 bg-[#1a1a1a] rounded-2xl">
                <div className="space-y-1">
                  <p className="text-[#606060] text-xs">Type</p>
                  <p className="font-medium text-white">{resource.type}</p>
                </div>
                {resource.lastCheck && (
                  <div className="space-y-1">
                    <p className="text-[#606060] text-xs">Last Check</p>
                    <p className="font-medium text-white">{resource.lastCheck}</p>
                  </div>
                )}
                {resource.cpu && (
                  <div className="space-y-1">
                    <p className="text-[#606060] text-xs">Response</p>
                    <p className="font-medium text-white">{resource.cpu}</p>
                  </div>
                )}
                {resource.memory && (
                  <div className="space-y-1">
                    <p className="text-[#606060] text-xs">Uptime</p>
                    <p className="font-medium text-white">{resource.memory}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

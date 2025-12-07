"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Bot, 
  RefreshCw, 
  Eye, 
  Bug,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface Vulnerability {
  id: string;
  severity: string;
  package: string;
  version: string;
  fixedIn: string;
  location: string;
  status: string;
  detected: string;
  agentFound: boolean;
}

interface SecurityStats {
  securityScore: number;
  criticalIssues: number;
  testsPassed: number;
  totalTests: number;
  lastScan: string;
  agentScans: number;
}

export default function SecurityPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    securityScore: 0,
    criticalIssues: 0,
    testsPassed: 0,
    totalTests: 0,
    lastScan: "Never",
    agentScans: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch agent tasks to get security-related data
      const tasksRes = await fetch("/api/agent-tasks?limit=100");
      const tasksData = await tasksRes.json();
      const tasks = tasksData.tasks || [];

      // Filter security-related tasks
      const securityTasks = tasks.filter((t: any) => t.agentType === "SECURITY");
      const completedSecurityTasks = securityTasks.filter((t: any) => t.status === "COMPLETED");
      const failedSecurityTasks = securityTasks.filter((t: any) => t.status === "FAILED");

      // Fetch incidents to get security issues
      const incidentsRes = await fetch("/api/incidents?limit=50");
      const incidentsData = await incidentsRes.json();
      const incidents = incidentsData.incidents || [];

      // Filter security-related incidents
      const securityIncidents = incidents.filter((i: any) => 
        i.title?.toLowerCase().includes("security") || 
        i.title?.toLowerCase().includes("vulnerability") ||
        i.severity === "critical"
      );

      // Map incidents to vulnerabilities format
      const mappedVulns: Vulnerability[] = securityIncidents.slice(0, 10).map((incident: any, index: number) => ({
        id: `VULN-${incident.id?.slice(-4) || index}`,
        severity: incident.severity || "medium",
        package: incident.title || "Unknown",
        version: "Detected",
        fixedIn: incident.status === "resolved" ? "Fixed" : "Pending",
        location: incident.affectedResource || "System",
        status: incident.status,
        detected: formatTimeAgo(incident.createdAt),
        agentFound: true,
      }));

      // Add sample data if no security incidents
      if (mappedVulns.length === 0) {
        mappedVulns.push({
          id: "VULN-DEMO",
          severity: "low",
          package: "No vulnerabilities found",
          version: "-",
          fixedIn: "-",
          location: "All systems secure",
          status: "passed",
          detected: "-",
          agentFound: false,
        });
      }

      setVulnerabilities(mappedVulns);

      // Calculate stats
      const criticalCount = mappedVulns.filter(v => v.severity === "critical").length;
      const totalScans = securityTasks.length;
      const passedScans = completedSecurityTasks.length;
      const score = totalScans > 0 
        ? Math.round(100 - (criticalCount * 15) - (failedSecurityTasks.length * 5))
        : 100;

      setStats({
        securityScore: Math.max(0, Math.min(100, score)),
        criticalIssues: criticalCount,
        testsPassed: passedScans,
        totalTests: totalScans,
        lastScan: securityTasks[0]?.createdAt 
          ? new Date(securityTasks[0].createdAt).toLocaleTimeString() 
          : "Never",
        agentScans: totalScans,
      });

    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: string): string => {
    if (!date) return "-";
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = Math.round((now - then) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const triggerSecurityScan = async () => {
    try {
      const res = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "SECURITY",
          name: "Security vulnerability scan",
          trigger: "manual",
        }),
      });
      
      if (res.ok) {
        toast.success("Security scan triggered");
        fetchSecurityData();
      }
    } catch (error) {
      toast.error("Failed to trigger security scan");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="bg-red-500/20 text-red-400 border-0">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/20 text-orange-400 border-0">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Medium</Badge>;
      case "low": return <Badge className="bg-[#333] text-[#808080] border-0">Low</Badge>;
      default: return <Badge className="bg-[#333] text-[#808080] border-0">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">Open</Badge>;
      case "patched":
      case "resolved":
      case "passed": return <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">Resolved</Badge>;
      case "ignored": return <Badge className="bg-[#333] text-[#808080] border-0">Ignored</Badge>;
      default: return <Badge className="bg-[#333] text-[#808080] border-0">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Security & Compliance</h2>
          <p className="text-[#808080]">Real-time security data from AI security agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSecurityData}
            className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={triggerSecurityScan}
            className="bg-white text-black hover:bg-gray-100"
          >
            <Shield className="mr-2 h-4 w-4" />
            Run Scan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-3xl p-5 border ${stats.securityScore >= 80 ? "bg-[#e0f2e9] border-emerald-100" : stats.securityScore >= 60 ? "bg-[#fff9c4] border-yellow-100" : "bg-[#ffebee] border-red-100"} transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${stats.securityScore >= 80 ? "text-emerald-800" : stats.securityScore >= 60 ? "text-yellow-800" : "text-red-800"}`}>Security Score</span>
            <Shield className={`h-4 w-4 ${stats.securityScore >= 80 ? "text-emerald-600" : stats.securityScore >= 60 ? "text-yellow-600" : "text-red-600"}`} />
          </div>
          <div className={`text-3xl font-bold ${stats.securityScore >= 80 ? "text-emerald-900" : stats.securityScore >= 60 ? "text-yellow-900" : "text-red-900"}`}>
            {stats.securityScore}/100
          </div>
          <p className={`text-xs mt-1 ${stats.securityScore >= 80 ? "text-emerald-700" : stats.securityScore >= 60 ? "text-yellow-700" : "text-red-700"}`}>
            {stats.securityScore >= 80 ? "Good standing" : stats.securityScore >= 60 ? "Needs attention" : "Critical issues"}
          </p>
        </div>

        <div className="bg-[#ffebee] rounded-3xl p-5 text-red-900 border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-red-800">Critical Issues</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-900">
            {stats.criticalIssues}
          </div>
          <p className="text-xs text-red-700 mt-1">
            {stats.criticalIssues > 0 ? "Requires immediate attention" : "No critical issues"}
          </p>
        </div>

        <div className="bg-[#fae8ff] rounded-3xl p-5 text-fuchsia-900 border border-fuchsia-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-fuchsia-800">Agent Scans</span>
            <Bot className="h-4 w-4 text-fuchsia-600" />
          </div>
          <div className="text-3xl font-bold text-fuchsia-900">{stats.testsPassed}/{stats.totalTests}</div>
          <p className="text-xs text-fuchsia-700 mt-1">Security scans completed</p>
        </div>

        <div className="bg-[#e0f7fa] rounded-3xl p-5 text-cyan-900 border border-cyan-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-cyan-800">Last Scan</span>
            <Eye className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-xl font-bold text-cyan-900 mt-1">{stats.lastScan}</div>
          <p className="text-xs text-cyan-700 mt-2">Most recent security check</p>
        </div>
      </div>

      {/* Vulnerability Table */}
      <div className="border border-[#2a2a2a] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Bug className="h-5 w-5 text-violet-400" />
                Vulnerability Scan Results
              </h3>
              <p className="text-[#808080] text-sm mt-1">
                Security findings from AI security agent scans
              </p>
            </div>
          </div>
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
                    <th className="pb-4">ID</th>
                    <th className="pb-4">Severity</th>
                    <th className="pb-4">Issue</th>
                    <th className="pb-4">Location</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Detected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {vulnerabilities.map((vuln) => (
                    <tr key={vuln.id} className="hover:bg-[#222] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-2 font-medium text-white">
                          {vuln.agentFound && <Bot className="h-3 w-3 text-violet-400" />}
                          {vuln.id}
                        </div>
                      </td>
                      <td className="py-4">{getSeverityBadge(vuln.severity)}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{vuln.package}</span>
                          <span className="text-xs text-[#808080]">{vuln.version} → {vuln.fixedIn}</span>
                        </div>
                      </td>
                      <td className="py-4 text-[#808080]">{vuln.location}</td>
                      <td className="py-4">{getStatusBadge(vuln.status)}</td>
                      <td className="py-4 text-[#808080]">{vuln.detected}</td>
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

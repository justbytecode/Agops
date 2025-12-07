"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  RefreshCw,
  Bot,
  Wrench,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  rootCause?: string;
  createdAt: string;
  resolvedAt?: string;
  metadata?: any;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const fetchIncidents = async () => {
    try {
      const status = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const res = await fetch(`/api/incidents?limit=100${status}`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
        setCounts(data.counts || {});
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIncidentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        toast.success(`Incident ${status.toLowerCase()}`);
        fetchIncidents();
      }
    } catch (error) {
      toast.error("Failed to update incident");
    }
  };

  const triggerRCA = async (id: string) => {
    try {
      const res = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "RCA",
          name: `RCA for incident ${id}`,
          trigger: "manual",
          incidentId: id,
        }),
      });
      
      if (res.ok) {
        toast.success("RCA Agent triggered");
      }
    } catch (error) {
      toast.error("Failed to trigger RCA");
    }
  };

  const triggerRemediation = async (id: string) => {
    try {
      const res = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "REMEDIATION",
          name: `Remediation for incident ${id}`,
          trigger: "manual",
          incidentId: id,
        }),
      });
      
      if (res.ok) {
        toast.success("Remediation Agent triggered");
      }
    } catch (error) {
      toast.error("Failed to trigger remediation");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return <Badge className="bg-red-500/20 text-red-400 border-0">Critical</Badge>;
      case "HIGH": return <Badge className="bg-orange-500/20 text-orange-400 border-0">High</Badge>;
      case "MEDIUM": return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Medium</Badge>;
      case "LOW": return <Badge className="bg-[#333] text-[#808080] border-0">Low</Badge>;
      default: return <Badge className="bg-[#333] text-[#808080] border-0">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN": return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "INVESTIGATING": return <Clock className="h-4 w-4 text-yellow-400" />;
      case "RESOLVED": return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "CLOSED": return <CheckCircle className="h-4 w-4 text-[#808080]" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredIncidents = incidents.filter((inc) =>
    inc.title.toLowerCase().includes(filter.toLowerCase()) ||
    inc.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Incidents</h2>
          <p className="text-[#808080]">AI-detected issues and their resolution status</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchIncidents}
          className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div 
          onClick={() => setStatusFilter("all")}
          className={`bg-[#e4ebf5] rounded-3xl p-5 cursor-pointer transition-all ${statusFilter === "all" ? "ring-2 ring-white" : ""} hover:scale-[1.02]`}
        >
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="text-3xl font-bold text-slate-900">{incidents.length}</p>
        </div>
        <div 
          onClick={() => setStatusFilter("OPEN")}
          className={`bg-[#ffebee] rounded-3xl p-5 cursor-pointer transition-all ${statusFilter === "OPEN" ? "ring-2 ring-white" : ""} hover:scale-[1.02]`}
        >
          <p className="text-xs text-red-600 mb-1">Open</p>
          <p className="text-3xl font-bold text-red-900">{counts.OPEN || 0}</p>
        </div>
        <div 
          onClick={() => setStatusFilter("INVESTIGATING")}
          className={`bg-[#fff9c4] rounded-3xl p-5 cursor-pointer transition-all ${statusFilter === "INVESTIGATING" ? "ring-2 ring-white" : ""} hover:scale-[1.02]`}
        >
          <p className="text-xs text-yellow-700 mb-1">Investigating</p>
          <p className="text-3xl font-bold text-yellow-900">{counts.INVESTIGATING || 0}</p>
        </div>
        <div 
          onClick={() => setStatusFilter("RESOLVED")}
          className={`bg-[#e0f2e9] rounded-3xl p-5 cursor-pointer transition-all ${statusFilter === "RESOLVED" ? "ring-2 ring-white" : ""} hover:scale-[1.02]`}
        >
          <p className="text-xs text-green-600 mb-1">Resolved</p>
          <p className="text-3xl font-bold text-emerald-900">{counts.RESOLVED || 0}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#505050]" />
        <Input
          placeholder="Search incidents..."
          className="pl-9 bg-[#222] border-[#333] text-white placeholder:text-[#666]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Incidents List */}
      <div className="border border-[#2a2a2a] rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#808080]">Loading...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400 opacity-50" />
            <p className="text-[#808080]">No incidents found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 text-xs text-[#606060] font-medium uppercase tracking-wide bg-[#1f1f1f]">
              <span>Title</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Source</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>
            {/* Table Body */}
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-[#222] transition-colors">
                <div>
                  <p className="font-medium text-white truncate">{incident.title}</p>
                  {incident.description && (
                    <p className="text-xs text-[#808080] truncate max-w-xs">
                      {incident.description}
                    </p>
                  )}
                </div>
                <div>{getSeverityBadge(incident.severity)}</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(incident.status)}
                  <span className="capitalize text-sm">{incident.status.toLowerCase()}</span>
                </div>
                <div>
                  <Badge className="bg-[#333] text-[#808080] border-0 text-xs">
                    {incident.source === "monitoring_agent" ? "AI Monitoring" : incident.source}
                  </Badge>
                </div>
                <div className="text-sm text-[#808080]">
                  {new Date(incident.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center justify-end gap-2">
                  {incident.status === "OPEN" && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => updateIncidentStatus(incident.id, "INVESTIGATING")}
                        className="bg-[#2a2a2a] border border-[#333] hover:bg-[#333] text-white"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Investigate
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => triggerRCA(incident.id)}
                        title="Run Root Cause Analysis"
                        className="hover:bg-[#333]"
                      >
                        <Bot className="w-4 h-4 text-violet-400" />
                      </Button>
                    </>
                  )}
                  {incident.status === "INVESTIGATING" && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => triggerRemediation(incident.id)}
                        className="bg-[#2a2a2a] border border-[#333] hover:bg-[#333] text-white"
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Remediate
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => updateIncidentStatus(incident.id, "RESOLVED")}
                        className="hover:bg-[#333]"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

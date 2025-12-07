"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface Website {
  id: string;
  name: string;
  url: string;
  domain: string;
  status: string;
  verified: boolean;
  healthStatus: string;
  uptimePercent: number | null;
  avgResponseTime: number | null;
  lastHealthCheck: string | null;
  createdAt: string;
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const res = await fetch("/api/websites");
      if (res.ok) {
        const data = await res.json();
        setWebsites(data.websites || []);
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWebsite = async (id: string) => {
    if (!confirm("Are you sure you want to remove this website?")) return;
    
    try {
      const res = await fetch(`/api/websites?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setWebsites(websites.filter(w => w.id !== id));
        toast.success("Website removed");
      }
    } catch (error) {
      toast.error("Failed to remove website");
    }
  };

  const getStatusBadge = (status: string, verified: boolean) => {
    if (!verified) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Pending Verification</Badge>;
    }
    switch (status) {
      case "up":
        return <Badge className="bg-green-500/20 text-green-400 border-0"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case "down":
        return <Badge className="bg-red-500/20 text-red-400 border-0"><AlertCircle className="w-3 h-3 mr-1" />Down</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0"><Clock className="w-3 h-3 mr-1" />Degraded</Badge>;
      default:
        return <Badge className="bg-[#333] text-[#808080] border-0">Unknown</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-gray-900 dark:text-[#d0d0d0] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Connected Websites</h2>
          <p className="text-gray-500 dark:text-[#808080]">
            Manage and monitor your connected websites and applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchWebsites}
            className="bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#808080] hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#333]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/websites/add">
            <Button className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </Link>
        </div>
      </div>

      {/* Website Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-gray-100 dark:bg-[#222] animate-pulse" />
          ))}
        </div>
      ) : websites.length === 0 ? (
        <div className="border border-dashed border-gray-200 dark:border-[#333] rounded-3xl p-12 flex flex-col items-center justify-center">
          <Globe className="w-12 h-12 text-gray-400 dark:text-[#505050] mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No websites connected</h3>
          <p className="text-gray-500 dark:text-[#808080] text-center mb-4">
            Connect your first website to start monitoring with AI agents
          </p>
          <Link href="/websites/add">
            <Button className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Website
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website) => (
            <div 
              key={website.id} 
              className="bg-[#e4ebf5] rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 text-slate-800 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{website.name}</h3>
                    <p className="text-xs text-slate-500">{website.domain}</p>
                  </div>
                </div>
                {getStatusBadge(website.healthStatus, website.verified)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Uptime</p>
                  <p className="text-xl font-bold text-slate-900">
                    {website.uptimePercent != null ? `${website.uptimePercent.toFixed(1)}%` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Response</p>
                  <p className="text-xl font-bold text-slate-900">
                    {website.avgResponseTime != null ? `${website.avgResponseTime}ms` : "N/A"}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteWebsite(website.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

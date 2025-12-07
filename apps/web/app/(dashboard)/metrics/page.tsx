"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown, Globe, Clock, AlertTriangle } from "lucide-react";

interface WebsiteMetric {
  id: string;
  name: string;
  url: string;
  healthStatus: string;
  avgResponseTime: number | null;
  uptime: number;
}

interface HealthCheckData {
  time: string;
  responseTime: number;
  status: string;
}

export default function MetricsPage() {
  const [websites, setWebsites] = useState<WebsiteMetric[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheckData[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    fetchData();
  }, [selectedWebsite, timeRange]);

  const fetchData = async () => {
    try {
      const websitesRes = await fetch("/api/websites");
      if (websitesRes.ok) {
        const data = await websitesRes.json();
        setWebsites(data.websites || []);
      }

      const healthUrl = selectedWebsite !== "all" 
        ? `/api/health-checks?websiteId=${selectedWebsite}&limit=50`
        : "/api/health-checks?limit=100";
      
      const healthRes = await fetch(healthUrl);
      if (healthRes.ok) {
        const data = await healthRes.json();
        const checks = (data.healthChecks || []).map((c: any) => ({
          time: new Date(c.checkedAt).toLocaleTimeString(),
          responseTime: c.responseTime || 0,
          status: c.status,
        }));
        setHealthChecks(checks.reverse());
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const avgResponseTime = healthChecks.length > 0
    ? Math.round(healthChecks.reduce((a, b) => a + b.responseTime, 0) / healthChecks.length)
    : 0;
  
  const errorRate = healthChecks.length > 0
    ? ((healthChecks.filter(c => c.status === "down" || c.status === "error").length / healthChecks.length) * 100).toFixed(2)
    : 0;

  const healthyWebsites = websites.filter(w => w.healthStatus === "up").length;
  const uptime = websites.length > 0 ? Math.round((healthyWebsites / websites.length) * 100 * 10) / 10 : 100;

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Metrics & Monitoring</h2>
          <p className="text-[#808080]">Real-time performance data from your connected websites</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedWebsite} 
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="bg-[#222] border border-[#333] text-white rounded-xl px-3 py-2 text-sm"
          >
            <option value="all">All Websites</option>
            {websites.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#222] border border-[#333] text-white rounded-xl px-3 py-2 text-sm"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <Button 
            variant="outline" 
            onClick={fetchData}
            className="bg-[#2a2a2a] border-[#333] text-[#808080] hover:text-white hover:bg-[#333]"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#e4ebf5] rounded-3xl p-5 text-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Avg Response Time</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{avgResponseTime}ms</div>
          <div className="flex items-center text-xs text-slate-500 mt-1">
            {avgResponseTime < 300 ? (
              <><TrendingDown className="h-3 w-3 mr-1 text-green-500" />Good</>
            ) : (
              <><TrendingUp className="h-3 w-3 mr-1 text-yellow-500" />Slow</>
            )}
          </div>
        </div>

        <div className="bg-[#fff9c4] rounded-3xl p-5 text-yellow-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-yellow-700">Error Rate</span>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold">{errorRate}%</div>
          <div className="text-xs text-yellow-700 mt-1">From {healthChecks.length} checks</div>
        </div>

        <div className="bg-[#e0f2e9] rounded-3xl p-5 text-emerald-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-600">System Uptime</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{uptime}%</div>
          <div className="text-xs text-green-600 mt-1">{healthyWebsites}/{websites.length} websites healthy</div>
        </div>

        <div className="bg-[#f0e6ff] rounded-3xl p-5 text-purple-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-600">Health Checks</span>
            <Globe className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{healthChecks.length}</div>
          <div className="text-xs text-purple-600 mt-1">In {timeRange} period</div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="border border-[#2a2a2a] rounded-3xl p-6 bg-[#1a1a1a]">
        <h3 className="text-xl font-semibold text-white mb-2">Response Time Trend</h3>
        <p className="text-[#808080] text-sm mb-6">Average response times from health checks</p>
        
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-[#808080]">
            Loading...
          </div>
        ) : healthChecks.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#808080]">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No health check data yet</p>
              <p className="text-sm">Add websites to start monitoring</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <div className="flex items-end justify-between h-full gap-1">
              {healthChecks.slice(-30).map((check, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t ${
                      check.status === "up" ? "bg-green-500" : 
                      check.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ height: `${Math.min((check.responseTime / 1000) * 100, 100)}%` }}
                    title={`${check.responseTime}ms - ${check.status}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#808080]">
              <span>{healthChecks[0]?.time || ""}</span>
              <span>{healthChecks[healthChecks.length - 1]?.time || ""}</span>
            </div>
          </div>
        )}
      </div>

      {/* Website Health Grid */}
      <div className="border border-[#2a2a2a] rounded-3xl p-6 bg-[#1a1a1a]">
        <h3 className="text-xl font-semibold text-white mb-6">Website Health</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {websites.map(website => (
            <div key={website.id} className="bg-[#222] rounded-2xl p-4 border border-[#333]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white truncate">{website.name}</span>
                <Badge className={website.healthStatus === "up" ? "bg-green-500/20 text-green-400 border-0" : "bg-red-500/20 text-red-400 border-0"}>
                  {website.healthStatus}
                </Badge>
              </div>
              <p className="text-xs text-[#808080] truncate mb-3">{website.url}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#606060] text-xs">Response</p>
                  <p className="font-medium text-white">{website.avgResponseTime || "N/A"}ms</p>
                </div>
                <div>
                  <p className="text-[#606060] text-xs">Uptime</p>
                  <p className="font-medium text-white">{website.uptime || 100}%</p>
                </div>
              </div>
            </div>
          ))}
          {websites.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-[#808080]">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No websites connected yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

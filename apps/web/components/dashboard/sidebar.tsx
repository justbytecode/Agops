"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  AlertTriangle,
  Bot,
  Activity,
  GitBranch,
  Server,
  Shield,
  Settings,
  Users,
  Plug,
  Globe,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Stats {
  websites: { total: number; healthy: number; unhealthy: number };
  incidents: { open: number; investigating: number; total: number };
  agents: { running: number; completed: number };
  integrations: { connected: number };
  team: { members: number };
  uptime: number;
}

const getRoutes = (stats: Stats | null) => [
  {
    group: "GENERAL",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-white",
        badge: null,
      },
      {
        label: "Websites",
        icon: Globe,
        href: "/websites",
        color: "text-white",
        badge: stats?.websites.total || null,
        badgeVariant: stats?.websites.unhealthy ? "destructive" : "secondary",
      },
      {
        label: "AI Agents",
        icon: Bot,
        href: "/agents",
        color: "text-white",
        badge: stats?.agents.running || null,
        badgeVariant: "default",
      },
    ]
  },
  {
    group: "TOOLS/RESOURCES",
    items: [
      {
        label: "Incidents",
        icon: AlertTriangle,
        href: "/incidents",
        color: "text-white",
        badge: stats?.incidents.open || null,
        badgeVariant: stats?.incidents.open ? "destructive" : "secondary",
      },
      {
        label: "Integrations",
        icon: Plug,
        href: "/integrations",
        color: "text-white",
        badge: stats?.integrations.connected || null,
        badgeVariant: "secondary",
      },
      {
        label: "Metrics",
        icon: Activity,
        href: "/metrics",
        color: "text-white",
        badge: null,
        testId: "metrics-nav-item"
      },
      {
        label: "Pipelines",
        icon: GitBranch,
        href: "/pipelines",
        color: "text-white",
        badge: null,
      },
      {
        label: "Infrastructure",
        icon: Server,
        href: "/infrastructure",
        color: "text-white",
        badge: null,
      },
      {
        label: "Security",
        icon: Shield,
        href: "/security",
        color: "text-white",
        badge: null,
      },
    ]
  },
  {
    group: "SETTINGS",
    items: [
      {
        label: "Team",
        icon: Users,
        href: "/team",
        color: "text-white",
        badge: stats?.team.members || null,
        badgeVariant: "secondary",
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        color: "text-white",
        badge: null,
      },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const routeGroups = getRoutes(stats);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 },
  };

  const mobileVariants = {
    closed: { x: "-100%" },
    open: { x: 0 },
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        className={cn(
          "fixed md:relative z-50 h-full flex flex-col shadow-2xl md:shadow-none font-sans",
          "md:translate-x-0 border-r transition-colors duration-300",
          "bg-white dark:bg-[#1a1a1a]",
          "border-gray-200 dark:border-[#2a2a2a]",
          "text-gray-600 dark:text-[#808080]"
        )}
        variants={isMobile ? mobileVariants : sidebarVariants}
        initial={false}
        animate={
          isMobile 
            ? (isMobileOpen ? "open" : "closed") 
            : (isCollapsed ? "collapsed" : "expanded")
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header/Logo Area */}
        <div className="h-20 flex items-center px-6 relative z-10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group" onClick={() => setIsMobileOpen(false)}>
            <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0 transition-colors">
              <span className="font-bold text-lg text-white dark:text-black">A</span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg tracking-tight whitespace-nowrap text-gray-900 dark:text-white transition-colors">
                    Agops
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          
          <div className="ml-auto flex items-center">
             {/* Desktop Collapse Button */}
             <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-6 w-6 text-gray-500 dark:text-[#505050] hover:text-black dark:hover:text-white hover:bg-transparent"
              onClick={toggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-4 space-y-6 scrollbar-none">
          {routeGroups.map((group, i) => (
            <div key={i}>
              {!isCollapsed && (
                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-[#505050] mb-3 px-2 tracking-wider uppercase">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((route) => {
                  const isActive = pathname === route.href || pathname?.startsWith(route.href + "/");
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                        isActive 
                          ? "bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white" 
                          : "text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#222222] hover:text-gray-900 dark:hover:text-[#d0d0d0]"
                      )}
                    >
                      <route.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-[#808080] group-hover:text-gray-900 dark:group-hover:text-[#d0d0d0]",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )} />
                      
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap"
                        >
                          <span className="text-sm font-medium">{route.label}</span>
                          {route.badge !== null && route.badge > 0 && (
                            <span className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                              {route.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-800 dark:bg-[#2a2a2a] text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap border border-gray-700 dark:border-[#333]">
                          {route.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          
           {/* Dark Mode Toggle Item */}
           <div className="space-y-1 mt-6">
              {!isCollapsed && (
                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-[#505050] mb-3 px-2 tracking-wider uppercase">
                  SETTINGS
                </h3>
              )}
               <div 
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-500 dark:text-[#808080] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors cursor-pointer select-none",
                    isCollapsed && "justify-center"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                  }}
               >
                  <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {!isCollapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
                  </div>
                  {!isCollapsed && (
                    <Switch 
                      checked={theme === 'dark'} 
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      className="data-[state=checked]:bg-white h-4 w-8" 
                    />
                  )}
               </div>
           </div>
        </div>

        {/* Hide Scrollbar CSS */}
        <style jsx global>{`
          .scrollbar-none {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
          .scrollbar-none::-webkit-scrollbar {
            display: none; /* Chrome, Safari, and Opera */
          }
        `}</style>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a] mt-auto">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-2 mb-4">
               <Avatar className="h-9 w-9 border border-gray-200 dark:border-[#333]">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white text-xs">
                    {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
               </Avatar>
               <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session?.user?.name || "Loading..."}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-[#666] truncate">
                    {session?.user?.email || ""}
                  </span>
               </div>
            </div>
          ) : (
             <div className="flex justify-center mb-4">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-[#333]">
                   <AvatarImage src={session?.user?.image || undefined} />
                   <AvatarFallback className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white text-xs">
                    {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
                   </AvatarFallback>
                </Avatar>
             </div>
          )}

          <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                  "flex items-center gap-2 text-xs font-medium text-red-500 hover:text-red-400 transition-colors w-full rounded-lg py-2",
                  isCollapsed ? "justify-center" : "px-2"
              )}
          >
            <LogOut className="h-3.5 w-3.5" />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

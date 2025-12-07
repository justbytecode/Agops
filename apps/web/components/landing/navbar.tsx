"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Agents", href: "#agents" },
    { name: "Workflow", href: "#workflow" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "pointer-events-auto flex items-center justify-between px-6 h-14 rounded-full transition-all duration-300 backdrop-blur-md border border-white/5",
          isScrolled
            ? "bg-background/80 shadow-2xl dark:bg-[#1a1a1a]  w-full max-w-4xl border-white/10"
            : "bg-background/40 w-full max-w-5xl"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group mr-8">
          <div className="relative w-6 h-6 overflow-hidden rounded-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0.5 bg-black/90 rounded-[4px] flex items-center justify-center backdrop-blur-sm">
              <span className="font-bold text-xs text-white">A</span>
            </div>
          </div>
          <span className="font-bold text-sm tracking-tight">AgentOps</span>
        </Link>

        {/* Desktop Menu - Centered */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-violet-500 rounded-full group-hover:w-full transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3 ml-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-full hover:bg-white/10"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-4 rounded-full text-sm font-medium hover:bg-white/10"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="h-8 px-4 rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-8 h-8 rounded-full"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-2 md:hidden"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium py-3 px-4 rounded-xl hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="ghost" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full justify-center bg-white text-black hover:bg-white/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

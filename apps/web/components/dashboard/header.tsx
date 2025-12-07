"use client";

import { useState } from "react";
import { 
  Bell, 
  Search, 
  History, 
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="h-20 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] px-8 flex items-center justify-end transition-colors duration-300">
      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Action Icons */}
        <div className="flex items-center gap-1 text-gray-500 dark:text-[#808080]">
          <Button variant="ghost" size="icon" className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg">
            <History className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

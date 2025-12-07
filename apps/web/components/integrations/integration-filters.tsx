"use client";

import { IntegrationProvider, IntegrationCategory, INTEGRATION_CATEGORIES } from "@/types/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationFiltersProps {
  selectedCategory: IntegrationCategory | "all";
  onSelectCategory: (category: IntegrationCategory | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function IntegrationFilters({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: IntegrationFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search integrations..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory("all")}
          className="rounded-full"
        >
          All
        </Button>
        {INTEGRATION_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className="rounded-full"
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

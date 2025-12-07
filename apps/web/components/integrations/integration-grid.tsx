"use client";

import { IntegrationProvider, IntegrationConnection, IntegrationCategory } from "@/types/integrations";
import { IntegrationCard } from "./integration-card";
import { IntegrationFilters } from "./integration-filters";
import { useState, useMemo } from "react";

interface IntegrationGridProps {
  providers: IntegrationProvider[];
  connections: IntegrationConnection[];
  onConnect: (provider: IntegrationProvider) => void;
  onConfigure: (connection: IntegrationConnection) => void;
  isConnecting?: string | null;
}

export function IntegrationGrid({ providers, connections, onConnect, onConfigure, isConnecting }: IntegrationGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
      const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            provider.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [providers, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <IntegrationFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProviders.map((provider) => {
          const connection = connections.find((c) => c.providerId === provider.id);
          return (
            <IntegrationCard
              key={provider.id}
              provider={provider}
              connection={connection}
              onConnect={onConnect}
              onConfigure={onConfigure}
              isConnecting={isConnecting === provider.id}
            />
          );
        })}
      </div>
      
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No integrations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

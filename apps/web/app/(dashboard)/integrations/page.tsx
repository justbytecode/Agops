"use client";

import { IntegrationGrid } from "@/components/integrations/integration-grid";
import { ConnectionModal } from "@/components/integrations/connection-modal";
import { INTEGRATION_PROVIDERS, IntegrationProvider, IntegrationConnection } from "@/types/integrations";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

// OAuth-supported providers that can be connected via OAuth2.0
const OAUTH_PROVIDERS = ["github", "gitlab", "slack", "google", "jira", "azure"];

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<IntegrationConnection | undefined>(undefined);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // Fetch connections on mount
  useEffect(() => {
    fetchConnections();
  }, []);

  // Handle OAuth callback messages
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      toast.success(`Successfully connected to ${connected}`);
      fetchConnections();
      // Clean URL
      window.history.replaceState({}, "", "/integrations");
    }

    if (error) {
      toast.error(`OAuth error: ${error.replace(/_/g, " ")}`);
      window.history.replaceState({}, "", "/integrations");
    }
  }, [searchParams]);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/integrations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // Map OAuth connections to IntegrationConnection format
      const mappedConnections: IntegrationConnection[] = (data.connections || []).map((conn: any) => ({
        id: conn.id,
        providerId: conn.provider.toLowerCase(),
        name: conn.displayName || conn.provider,
        status: conn.status === "connected" ? "connected" : "disconnected",
        config: {},
        lastSyncAt: conn.lastSyncAt,
        createdAt: conn.createdAt,
        updatedAt: conn.createdAt,
      }));
      
      setConnections(mappedConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (provider: IntegrationProvider) => {
    // Check if this is an OAuth provider
    if (OAUTH_PROVIDERS.includes(provider.id)) {
      setIsConnecting(provider.id);
      try {
        const res = await fetch(`/api/integrations/${provider.id}/connect`);
        const data = await res.json();
        
        if (!res.ok) {
          toast.error(data.error || "Failed to connect");
          return;
        }

        // Redirect to OAuth authorization URL
        window.location.href = data.authUrl;
      } catch (error) {
        toast.error("Failed to initiate connection");
      } finally {
        setIsConnecting(null);
      }
    } else {
      // For non-OAuth providers, show modal for API key/credentials
      setSelectedProvider(provider);
      setSelectedConnection(undefined);
      setIsModalOpen(true);
    }
  };

  const handleConfigure = (connection: IntegrationConnection) => {
    const provider = INTEGRATION_PROVIDERS.find((p) => p.id === connection.providerId);
    if (provider) {
      setSelectedProvider(provider);
      setSelectedConnection(connection);
      setIsModalOpen(true);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      const res = await fetch(`/api/integrations?provider=${providerId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        toast.success("Disconnected successfully");
        setConnections(connections.filter(c => c.providerId !== providerId));
      } else {
        toast.error("Failed to disconnect");
      }
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const handleSaveConnection = async (data: any) => {
    // Simulate API call for non-OAuth connections
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (selectedConnection) {
      // Update existing connection
      setConnections(connections.map(c => 
        c.id === selectedConnection.id ? { ...c, updatedAt: new Date().toISOString() } : c
      ));
      toast.success(`Updated connection to ${selectedProvider?.name}`);
    } else {
      // Create new connection
      const newConnection: IntegrationConnection = {
        id: Math.random().toString(36).substr(2, 9),
        providerId: selectedProvider!.id,
        name: selectedProvider!.name,
        status: "connected",
        config: data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConnections([...connections, newConnection]);
      toast.success(`Successfully connected to ${selectedProvider?.name}`);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Integrations</h2>
          {isLoading && (
            <span className="text-sm text-[#808080]">Loading...</span>
          )}
        </div>
      </div>
      
      <div className="space-y-8">
        <p className="text-[#808080]">
          Connect and manage your DevOps tools and services. OAuth-enabled integrations 
          (GitHub, GitLab, Slack, etc.) use secure OAuth 2.0 authentication.
        </p>
        
        <IntegrationGrid
          providers={INTEGRATION_PROVIDERS}
          connections={connections}
          onConnect={handleConnect}
          onConfigure={handleConfigure}
          isConnecting={isConnecting}
        />
      </div>

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={selectedProvider}
        connection={selectedConnection}
        onConnect={handleSaveConnection}
      />
    </div>
  );
}

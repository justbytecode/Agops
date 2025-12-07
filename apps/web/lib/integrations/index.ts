// Integration clients index
// Central access point for all DevOps tool integrations

export { GitHubClient, getGitHubClient } from "./github";
export { AWSClient, getAWSClient } from "./aws";
export { KubernetesClient, getKubernetesClient } from "./kubernetes";
export { SlackClient, getSlackClient } from "./slack";

// Get all connected integrations for a tenant
import { prisma } from "@/lib/db";

export async function getConnectedIntegrations(tenantId: string) {
  const connections = await prisma.oAuthConnection.findMany({
    where: { tenantId, status: "connected" },
    select: {
      provider: true,
      displayName: true,
      lastSyncAt: true,
    },
  });

  return connections.map((c) => ({
    provider: c.provider.toLowerCase(),
    name: c.displayName,
    lastSync: c.lastSyncAt,
  }));
}

// Integration health check
export async function checkIntegrationHealth(tenantId: string, provider: string): Promise<{
  healthy: boolean;
  message: string;
}> {
  try {
    switch (provider.toLowerCase()) {
      case "github": {
        const { getGitHubClient } = await import("./github");
        const client = await getGitHubClient(tenantId);
        if (!client) return { healthy: false, message: "Not connected" };
        await client.getAuthenticatedUser();
        return { healthy: true, message: "Connected" };
      }
      case "slack": {
        const { getSlackClient } = await import("./slack");
        const client = await getSlackClient(tenantId);
        if (!client) return { healthy: false, message: "Not connected" };
        await client.listChannels();
        return { healthy: true, message: "Connected" };
      }
      default:
        return { healthy: false, message: "Unknown provider" };
    }
  } catch (error: any) {
    return { healthy: false, message: error.message };
  }
}

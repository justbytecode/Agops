// Slack Integration Client
// Used by AI agents to send notifications and alerts

import { prisma } from "@/lib/db";

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  elements?: any[];
  accessory?: any;
}

interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: { title: string; value: string; short?: boolean }[];
  footer?: string;
  ts?: number;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}

export class SlackClient {
  private accessToken: string;
  private baseUrl = "https://slack.com/api";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(method: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  // Channel operations
  async listChannels(): Promise<SlackChannel[]> {
    const result = await this.request<any>("conversations.list", {
      types: "public_channel,private_channel",
      exclude_archived: true,
    });
    return result.channels || [];
  }

  async joinChannel(channelId: string): Promise<void> {
    await this.request("conversations.join", { channel: channelId });
  }

  // Messaging
  async postMessage(message: SlackMessage): Promise<{ ts: string; channel: string }> {
    const result = await this.request<any>("chat.postMessage", message);
    return { ts: result.ts, channel: result.channel };
  }

  async updateMessage(channel: string, ts: string, text: string, blocks?: SlackBlock[]): Promise<void> {
    await this.request("chat.update", { channel, ts, text, blocks });
  }

  async deleteMessage(channel: string, ts: string): Promise<void> {
    await this.request("chat.delete", { channel, ts });
  }

  // Higher-level notification methods for AI agents

  async sendIncidentAlert(
    channel: string,
    incident: {
      title: string;
      severity: "critical" | "high" | "medium" | "low";
      description: string;
      website?: string;
      timestamp: Date;
    }
  ): Promise<{ ts: string }> {
    const severityColors: Record<string, string> = {
      critical: "#dc2626",
      high: "#ea580c",
      medium: "#ca8a04",
      low: "#2563eb",
    };

    const severityEmoji: Record<string, string> = {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
    };

    return this.postMessage({
      channel,
      text: `${severityEmoji[incident.severity]} ${incident.title}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${severityEmoji[incident.severity]} Incident Detected`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${incident.title}*\n${incident.description}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*Severity:* ${incident.severity.toUpperCase()} | *Time:* ${incident.timestamp.toISOString()}${incident.website ? ` | *Website:* ${incident.website}` : ""}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View in Dashboard", emoji: true },
              url: `${process.env.NEXTAUTH_URL}/incidents`,
              style: "primary",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Acknowledge", emoji: true },
              action_id: "acknowledge_incident",
            },
          ],
        },
      ],
    });
  }

  async sendDeploymentNotification(
    channel: string,
    deployment: {
      status: "started" | "success" | "failed";
      service: string;
      version: string;
      environment: string;
      triggeredBy?: string;
    }
  ): Promise<{ ts: string }> {
    const statusEmoji: Record<string, string> = {
      started: "🚀",
      success: "✅",
      failed: "❌",
    };

    const statusColor: Record<string, string> = {
      started: "#3b82f6",
      success: "#22c55e",
      failed: "#ef4444",
    };

    return this.postMessage({
      channel,
      text: `${statusEmoji[deployment.status]} Deployment ${deployment.status}: ${deployment.service}`,
      attachments: [
        {
          color: statusColor[deployment.status],
          title: `Deployment ${deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}`,
          fields: [
            { title: "Service", value: deployment.service, short: true },
            { title: "Version", value: deployment.version, short: true },
            { title: "Environment", value: deployment.environment, short: true },
            ...(deployment.triggeredBy
              ? [{ title: "Triggered By", value: deployment.triggeredBy, short: true }]
              : []),
          ],
          footer: "AgentOps AI",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    });
  }

  async sendAgentActionNotification(
    channel: string,
    action: {
      agentType: string;
      action: string;
      target: string;
      status: "pending" | "approved" | "executed" | "failed";
      requiresApproval?: boolean;
    }
  ): Promise<{ ts: string }> {
    return this.postMessage({
      channel,
      text: `🤖 AI Agent Action: ${action.action}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*AI Agent Action*\n\n*Agent:* ${action.agentType}\n*Action:* ${action.action}\n*Target:* ${action.target}\n*Status:* ${action.status}`,
          },
        },
        ...(action.requiresApproval && action.status === "pending"
          ? [
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: { type: "plain_text", text: "✅ Approve", emoji: true },
                    style: "primary" as const,
                    action_id: "approve_agent_action",
                  },
                  {
                    type: "button",
                    text: { type: "plain_text", text: "❌ Reject", emoji: true },
                    style: "danger" as const,
                    action_id: "reject_agent_action",
                  },
                ],
              },
            ]
          : []),
      ],
    });
  }

  async sendHealthAlert(
    channel: string,
    health: {
      website: string;
      status: "up" | "down" | "degraded";
      responseTime?: number;
      statusCode?: number;
      message?: string;
    }
  ): Promise<{ ts: string }> {
    const statusEmoji: Record<string, string> = {
      up: "✅",
      down: "🔴",
      degraded: "🟡",
    };

    return this.postMessage({
      channel,
      text: `${statusEmoji[health.status]} ${health.website} is ${health.status}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${statusEmoji[health.status]} *${health.website}* is *${health.status.toUpperCase()}*${health.message ? `\n${health.message}` : ""}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${health.statusCode ? `Status: ${health.statusCode} | ` : ""}${health.responseTime ? `Response: ${health.responseTime}ms` : ""}`,
            },
          ],
        },
      ],
    });
  }
}

// Factory function to get Slack client for a tenant
export async function getSlackClient(tenantId: string): Promise<SlackClient | null> {
  const connection = await prisma.oAuthConnection.findUnique({
    where: {
      tenantId_provider: {
        tenantId,
        provider: "SLACK",
      },
    },
  });

  if (!connection || connection.status !== "connected") {
    return null;
  }

  return new SlackClient(connection.accessToken);
}

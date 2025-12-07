import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// OAuth configurations for different providers
const OAUTH_CONFIGS: Record<string, { authUrl: string; scopes: string[] }> = {
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    scopes: ["read:user", "user:email", "repo"],
  },
  gitlab: {
    authUrl: "https://gitlab.com/oauth/authorize",
    scopes: ["read_user", "read_api", "read_repository"],
  },
  slack: {
    authUrl: "https://slack.com/oauth/v2/authorize",
    scopes: ["channels:read", "chat:write", "users:read"],
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["https://www.googleapis.com/auth/cloud-platform.read-only"],
  },
  jira: {
    authUrl: "https://auth.atlassian.com/authorize",
    scopes: ["read:jira-work", "read:jira-user"],
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await params;
    const config = OAUTH_CONFIGS[provider.toLowerCase()];

    if (!config) {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Get client ID from environment
    const clientIdEnvKey = `${provider.toUpperCase()}_CLIENT_ID`;
    const clientId = process.env[clientIdEnvKey];

    if (!clientId) {
      return NextResponse.json(
        { error: `${provider} OAuth not configured. Please set ${clientIdEnvKey} in environment variables.` },
        { status: 400 }
      );
    }

    // Build OAuth authorization URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/${provider}/callback`;
    const state = Buffer.from(JSON.stringify({
      tenantId: session.user.tenantId,
      userId: session.user.id,
    })).toString("base64");

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", config.scopes.join(" "));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("response_type", "code");

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("OAuth connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}

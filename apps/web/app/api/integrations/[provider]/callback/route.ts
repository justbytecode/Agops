import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Token exchange URLs for different providers
const TOKEN_URLS: Record<string, string> = {
  github: "https://github.com/login/oauth/access_token",
  gitlab: "https://gitlab.com/oauth/token",
  slack: "https://slack.com/api/oauth.v2.access",
  google: "https://oauth2.googleapis.com/token",
  jira: "https://auth.atlassian.com/oauth/token",
};

// User info URLs for different providers
const USER_INFO_URLS: Record<string, string> = {
  github: "https://api.github.com/user",
  gitlab: "https://gitlab.com/api/v4/user",
  slack: "", // Slack returns user info in token response
  google: "https://www.googleapis.com/oauth2/v2/userinfo",
  jira: "https://api.atlassian.com/me",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/integrations?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/integrations?error=missing_params`
      );
    }

    // Decode state to get tenant and user info
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/integrations?error=invalid_state`
      );
    }

    const { tenantId, userId } = stateData;

    if (!tenantId) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/integrations?error=missing_tenant`
      );
    }

    // Get credentials from environment
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/integrations?error=oauth_not_configured`
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/${provider}/callback`;
    const tokenUrl = TOKEN_URLS[provider.toLowerCase()];

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/integrations?error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in;

    // Get user info from provider
    let displayName = "";
    let avatarUrl = "";
    let providerAccountId = "";
    let metadata = {};

    const userInfoUrl = USER_INFO_URLS[provider.toLowerCase()];
    if (userInfoUrl) {
      const userResponse = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Handle different provider response formats
        switch (provider.toLowerCase()) {
          case "github":
            displayName = userData.login;
            avatarUrl = userData.avatar_url;
            providerAccountId = String(userData.id);
            metadata = { login: userData.login, name: userData.name };
            break;
          case "gitlab":
            displayName = userData.username;
            avatarUrl = userData.avatar_url;
            providerAccountId = String(userData.id);
            metadata = { username: userData.username, name: userData.name };
            break;
          case "google":
            displayName = userData.email;
            avatarUrl = userData.picture;
            providerAccountId = userData.id;
            metadata = { email: userData.email, name: userData.name };
            break;
          default:
            displayName = userData.name || userData.email || provider;
            providerAccountId = userData.id || Date.now().toString();
        }
      }
    } else if (provider.toLowerCase() === "slack") {
      // Slack returns user info in token response
      displayName = tokens.team?.name || "Slack Workspace";
      providerAccountId = tokens.team?.id || tokens.authed_user?.id;
      metadata = { team: tokens.team, user: tokens.authed_user };
    }

    // Calculate expiration time
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000) 
      : null;

    // Map provider to enum value
    const providerEnum = provider.toUpperCase() as any;

    // Upsert OAuth connection in database
    await prisma.oAuthConnection.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider: providerEnum,
        },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
        displayName,
        avatarUrl,
        providerAccountId,
        metadata,
        status: "connected",
        lastSyncAt: new Date(),
        errorMessage: null,
      },
      create: {
        tenantId,
        provider: providerEnum,
        providerAccountId,
        accessToken,
        refreshToken,
        expiresAt,
        displayName,
        avatarUrl,
        metadata,
        status: "connected",
      },
    });

    // Redirect back to integrations page with success message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/integrations?connected=${provider}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/integrations?error=callback_failed`
    );
  }
}

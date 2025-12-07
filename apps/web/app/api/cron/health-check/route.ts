import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Health check endpoint that runs periodically
// Can be triggered by Vercel Cron, external scheduler, or manually

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CRON] Starting health checks...");
  
  try {
    // Get all verified websites that need checking
    const websites = await prisma.website.findMany({
      where: {
        verified: true,
        status: { not: "PAUSED" },
      },
      select: {
        id: true,
        name: true,
        url: true,
        tenantId: true,
      },
    });

    console.log(`[CRON] Found ${websites.length} websites to check`);

    const results = [];
    const incidents = [];

    for (const website of websites) {
      try {
        const result = await performHealthCheck(website);
        results.push(result);

        // Store the health check
        await prisma.healthCheck.create({
          data: {
            websiteId: website.id,
            type: "HTTPS",
            endpoint: "/",
            status: result.status,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
            errorMessage: result.error,
            sslValid: result.sslValid,
            sslExpiresAt: result.sslExpiresAt,
          },
        });

        // Update website health status
        await prisma.website.update({
          where: { id: website.id },
          data: {
            healthStatus: result.status,
            lastHealthCheck: new Date(),
            avgResponseTime: result.responseTime,
          },
        });

        // Create incident if website is down
        if (result.status === "down") {
          // Check if there's already an open incident for this website
          const existingIncident = await prisma.incident.findFirst({
            where: {
              source: "health_check",
              status: { in: ["OPEN", "INVESTIGATING"] },
              metadata: {
                path: ["websiteId"],
                equals: website.id,
              },
            },
          });

          if (!existingIncident) {
            const incident = await prisma.incident.create({
              data: {
                title: `${website.name} is down`,
                description: `Health check failed: ${result.error || "No response from server"}`,
                severity: "CRITICAL",
                source: "health_check",
                status: "OPEN",
                tenantId: website.tenantId,
                metadata: {
                  websiteId: website.id,
                  websiteUrl: website.url,
                  statusCode: result.statusCode,
                  error: result.error,
                },
              },
            });
            incidents.push(incident);
          }
        }

        // Auto-resolve incidents if website is back up
        if (result.status === "up") {
          await prisma.incident.updateMany({
            where: {
              source: "health_check",
              status: { in: ["OPEN", "INVESTIGATING"] },
              metadata: {
                path: ["websiteId"],
                equals: website.id,
              },
            },
            data: {
              status: "RESOLVED",
              resolvedAt: new Date(),
            },
          });
        }

      } catch (error) {
        console.error(`[CRON] Error checking ${website.name}:`, error);
        results.push({
          websiteId: website.id,
          name: website.name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`[CRON] Completed. Checked: ${results.length}, Incidents: ${incidents.length}`);

    return NextResponse.json({
      success: true,
      checked: results.length,
      incidentsCreated: incidents.length,
      results,
    });

  } catch (error) {
    console.error("[CRON] Health check cron failed:", error);
    return NextResponse.json(
      { error: "Health check cron failed" },
      { status: 500 }
    );
  }
}

async function performHealthCheck(website: { id: string; name: string; url: string }) {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(website.url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "AgentOps-HealthCheck/1.0",
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    let status: string;
    if (response.status >= 500) {
      status = "down";
    } else if (response.status >= 400) {
      status = "error";
    } else if (responseTime > 5000) {
      status = "degraded";
    } else if (responseTime > 1000) {
      status = "slow";
    } else {
      status = "up";
    }

    // Check SSL for HTTPS sites
    let sslValid = null;
    let sslExpiresAt = null;
    
    if (website.url.startsWith("https://")) {
      // SSL is valid if the fetch succeeded
      sslValid = true;
      // Note: Getting actual expiry date requires server-side SSL check
    }

    return {
      websiteId: website.id,
      name: website.name,
      status,
      statusCode: response.status,
      responseTime,
      sslValid,
      sslExpiresAt,
      error: null,
    };

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      websiteId: website.id,
      name: website.name,
      status: "down",
      statusCode: null,
      responseTime,
      sslValid: null,
      sslExpiresAt: null,
      error: error.message || "Connection failed",
    };
  }
}

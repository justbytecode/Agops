import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - List health checks for a tenant or website
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const from = searchParams.get("from");

    const where: any = {};
    
    if (websiteId) {
      // Verify user has access to this website
      const website = await prisma.website.findFirst({
        where: { id: websiteId, tenantId: session.user.tenantId },
      });
      if (!website) {
        return NextResponse.json({ error: "Website not found" }, { status: 404 });
      }
      where.websiteId = websiteId;
    } else {
      // Get all health checks for tenant's websites
      where.website = { tenantId: session.user.tenantId };
    }

    if (from) {
      where.checkedAt = { gte: new Date(from) };
    }

    const healthChecks = await prisma.healthCheck.findMany({
      where,
      include: {
        website: {
          select: { name: true, url: true },
        },
      },
      orderBy: { checkedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ healthChecks });
  } catch (error) {
    console.error("Error fetching health checks:", error);
    return NextResponse.json(
      { error: "Failed to fetch health checks" },
      { status: 500 }
    );
  }
}

// POST - Manually trigger a health check for a specific website
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await request.json();

    if (!websiteId) {
      return NextResponse.json(
        { error: "websiteId is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this website
    const website = await prisma.website.findFirst({
      where: { id: websiteId, tenantId: session.user.tenantId },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Perform the health check
    const startTime = Date.now();
    let result: any = {
      websiteId,
      status: "unknown",
      statusCode: null,
      responseTime: null,
      error: null,
    };

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

      result = {
        websiteId,
        status,
        statusCode: response.status,
        responseTime,
        error: null,
        sslValid: website.url.startsWith("https://"),
      };

    } catch (error: any) {
      result = {
        websiteId,
        status: "down",
        statusCode: null,
        responseTime: Date.now() - startTime,
        error: error.message || "Connection failed",
        sslValid: null,
      };
    }

    // Store the health check
    const healthCheck = await prisma.healthCheck.create({
      data: {
        websiteId,
        type: "HTTPS",
        endpoint: "/",
        status: result.status,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        errorMessage: result.error,
        sslValid: result.sslValid,
      },
    });

    // Update website
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        healthStatus: result.status,
        lastHealthCheck: new Date(),
        avgResponseTime: result.responseTime,
      },
    });

    return NextResponse.json({ healthCheck, result });
  } catch (error) {
    console.error("Error performing health check:", error);
    return NextResponse.json(
      { error: "Failed to perform health check" },
      { status: 500 }
    );
  }
}

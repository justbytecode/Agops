import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get all stats for sidebar badges and dashboard
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    // Get all counts in parallel
    const [
      websiteCount,
      healthyWebsiteCount,
      openIncidentCount,
      investigatingIncidentCount,
      runningTaskCount,
      completedTaskCount,
      integrationCount,
      teamMemberCount,
    ] = await Promise.all([
      prisma.website.count({ where: { tenantId } }),
      prisma.website.count({ where: { tenantId, healthStatus: "up" } }),
      prisma.incident.count({ where: { tenantId, status: "OPEN" } }),
      prisma.incident.count({ where: { tenantId, status: "INVESTIGATING" } }),
      prisma.agentTask.count({ where: { tenantId, status: "RUNNING" } }),
      prisma.agentTask.count({ where: { tenantId, status: "COMPLETED" } }),
      prisma.oAuthConnection.count({ where: { tenantId, status: "connected" } }),
      prisma.user.count({ where: { tenantId } }),
    ]);

    // Calculate uptime percentage
    const totalWebsites = websiteCount || 1;
    const uptime = Math.round((healthyWebsiteCount / totalWebsites) * 100 * 10) / 10;

    return NextResponse.json({
      websites: {
        total: websiteCount,
        healthy: healthyWebsiteCount,
        unhealthy: websiteCount - healthyWebsiteCount,
      },
      incidents: {
        open: openIncidentCount,
        investigating: investigatingIncidentCount,
        total: openIncidentCount + investigatingIncidentCount,
      },
      agents: {
        running: runningTaskCount,
        completed: completedTaskCount,
      },
      integrations: {
        connected: integrationCount,
      },
      team: {
        members: teamMemberCount,
      },
      uptime,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

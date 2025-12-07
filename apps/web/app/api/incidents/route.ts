import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - List incidents
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { tenantId: session.user.tenantId };
    
    if (status) {
      where.status = status.toUpperCase();
    }
    if (severity) {
      where.severity = severity.toUpperCase();
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        remediations: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get counts by status
    const counts = await prisma.incident.groupBy({
      by: ["status"],
      where: { tenantId: session.user.tenantId },
      _count: { status: true },
    });

    return NextResponse.json({ 
      incidents,
      counts: counts.reduce((acc, c) => ({ ...acc, [c.status]: c._count.status }), {}),
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

// POST - Create a new incident
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, severity, source, metadata } = body;

    if (!title || !severity) {
      return NextResponse.json(
        { error: "title and severity are required" },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description: description || "",
        severity: severity.toUpperCase(),
        source: source || "manual",
        status: "OPEN",
        tenantId: session.user.tenantId,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}

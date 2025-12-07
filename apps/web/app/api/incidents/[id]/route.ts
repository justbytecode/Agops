import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get single incident
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const incident = await prisma.incident.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        remediations: true,
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error fetching incident:", error);
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

// PATCH - Update incident
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rootCause, rcaAnalysis, severity, description } = body;

    // Verify ownership
    const existing = await prisma.incident.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status.toUpperCase();
    if (rootCause) updateData.rootCause = rootCause;
    if (rcaAnalysis) updateData.rcaAnalysis = rcaAnalysis;
    if (severity) updateData.severity = severity.toUpperCase();
    if (description !== undefined) updateData.description = description;

    // Set resolved timestamp if status changed to RESOLVED
    if (status === "RESOLVED" && existing.status !== "RESOLVED") {
      updateData.resolvedAt = new Date();
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

// DELETE - Delete incident
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.incident.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    await prisma.incident.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting incident:", error);
    return NextResponse.json(
      { error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}

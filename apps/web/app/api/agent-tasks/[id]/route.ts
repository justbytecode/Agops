import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get single agent task
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

    const task = await prisma.agentTask.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        logs: {
          orderBy: { timestamp: "desc" },
        },
        website: {
          select: { name: true, url: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching agent task:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent task" },
      { status: 500 }
    );
  }
}

// PATCH - Update agent task (for scheduler to update status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Allow internal updates without session for scheduler
    const { id } = await params;
    const body = await request.json();
    const { status, output, errorMessage, startedAt, completedAt } = body;

    const updateData: any = {};
    if (status) updateData.status = status.toUpperCase();
    if (output !== undefined) updateData.output = output;
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage;
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (completedAt) updateData.completedAt = new Date(completedAt);

    // Set startedAt if moving to RUNNING
    if (status === "RUNNING" && !startedAt) {
      updateData.startedAt = new Date();
    }

    const task = await prisma.agentTask.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating agent task:", error);
    return NextResponse.json(
      { error: "Failed to update agent task" },
      { status: 500 }
    );
  }
}

// DELETE - Delete agent task
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
    const existing = await prisma.agentTask.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Delete logs first
    await prisma.agentTaskLog.deleteMany({ where: { taskId: id } });
    await prisma.agentTask.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent task:", error);
    return NextResponse.json(
      { error: "Failed to delete agent task" },
      { status: 500 }
    );
  }
}

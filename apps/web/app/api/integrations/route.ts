import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - List all connected integrations for the user's tenant
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await prisma.oAuthConnection.findMany({
      where: { tenantId: session.user.tenantId },
      select: {
        id: true,
        provider: true,
        displayName: true,
        avatarUrl: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        errorMessage: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect an integration
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    await prisma.oAuthConnection.deleteMany({
      where: {
        tenantId: session.user.tenantId,
        provider: provider.toUpperCase() as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the website
    const website = await prisma.website.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // In production, you would verify DNS record or meta tag here
    // For now, we'll mark it as verified

    await prisma.website.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        status: "VERIFIED",
        healthStatus: "checking",
      },
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Error verifying website:", error);
    return NextResponse.json(
      { error: "Failed to verify website" },
      { status: 500 }
    );
  }
}

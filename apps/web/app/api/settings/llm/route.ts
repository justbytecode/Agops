import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's LLM configuration
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        openaiApiKey: true,
        anthropicApiKey: true,
        geminiApiKey: true,
        defaultLlmProvider: true,
      },
    });

    return NextResponse.json({
      openaiKey: user?.openaiApiKey ? maskKey(user.openaiApiKey) : "",
      anthropicKey: user?.anthropicApiKey ? maskKey(user.anthropicApiKey) : "",
      geminiKey: user?.geminiApiKey ? maskKey(user.geminiApiKey) : "",
      defaultProvider: user?.defaultLlmProvider || "openai",
      openaiValid: !!user?.openaiApiKey,
      anthropicValid: !!user?.anthropicApiKey,
      geminiValid: !!user?.geminiApiKey,
    });
  } catch (error) {
    console.error("Error fetching LLM config:", error);
    // Return empty config if user doesn't have these fields yet
    return NextResponse.json({
      openaiKey: "",
      anthropicKey: "",
      geminiKey: "",
      defaultProvider: "openai",
      openaiValid: false,
      anthropicValid: false,
      geminiValid: false,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { openaiKey, anthropicKey, geminiKey, defaultProvider } = body;

    // Update user's LLM configuration
    const updateData: any = {
      defaultLlmProvider: defaultProvider || "openai",
    };

    // Only update keys if they are not masked (contain actual new values)
    if (openaiKey && !openaiKey.includes("...")) {
      updateData.openaiApiKey = openaiKey;
    }
    if (anthropicKey && !anthropicKey.includes("...")) {
      updateData.anthropicApiKey = anthropicKey;
    }
    if (geminiKey && !geminiKey.includes("...")) {
      updateData.geminiApiKey = geminiKey;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      openaiValid: !!openaiKey,
      anthropicValid: !!anthropicKey,
      geminiValid: !!geminiKey,
    });
  } catch (error) {
    console.error("Error saving LLM config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function maskKey(key: string): string {
  if (!key || key.length < 10) return "";
  return key.slice(0, 6) + "..." + key.slice(-4);
}

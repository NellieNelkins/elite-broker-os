import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aiMessageSchema } from "@/lib/validations";
import { prisma } from "@/lib/db";

/**
 * Secure AI proxy route.
 * - Replaces the public Cloudflare Worker proxy
 * - API key stored server-side (not in localStorage)
 * - Input validation via zod
 * - Rate limited via middleware
 */
export async function POST(request: NextRequest) {
  // Try auth session first, fall back to first user (single-user app)
  const session = await auth();
  const userId = session?.user?.id || (
    await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } })
  )?.id;

  if (!userId) {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  const body = await request.json();
  const result = aiMessageSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Get API key from server-side env or user's stored key
  const apiKey = process.env.ANTHROPIC_API_KEY || (
    await prisma.user.findUnique({
      where: { id: userId },
      select: { apiKey: true },
    })
  )?.apiKey;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key configured. Add your Anthropic API key in Settings." },
      { status: 400 }
    );
  }

  const systemPrompts: Record<string, string> = {
    analysis:
      "You are an expert Dubai real estate analyst. Analyze the broker's data and provide actionable insights. Be specific with numbers and recommendations.",
    coaching:
      "You are an elite real estate sales coach specializing in Dubai luxury property. Provide motivating, specific advice to improve the broker's performance.",
    message_draft:
      "You are a professional real estate communication specialist. Draft a personalized WhatsApp message for the broker to send. Be warm but professional. Keep messages concise.",
    market_insight:
      "You are a Dubai real estate market analyst with deep knowledge of Emirates Living, Palm Jumeirah, and all Dubai communities. Provide data-driven market insights.",
    listing_optimize:
      "You are a listing optimization expert. Help improve property listing descriptions, pricing strategies, and marketing approaches for Dubai real estate.",
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompts[result.data.type] || systemPrompts.analysis,
        messages: [
          {
            role: "user",
            content: result.data.context
              ? `Context:\n${result.data.context}\n\nRequest:\n${result.data.prompt}`
              : result.data.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `AI API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: {
        content: data.content[0]?.text || "",
        model: data.model,
        usage: data.usage,
      },
    });
  } catch (error) {
    console.error("AI proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to AI service" },
      { status: 502 }
    );
  }
}

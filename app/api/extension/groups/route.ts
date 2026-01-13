import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiToken } from "@/server/utils/api-token-validation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.substring(7);
    const result = await validateApiToken(token);

    if (!result) {
      return NextResponse.json(
        { error: "Invalid API token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const groups = await db.group.findMany({
      where: { userId: result.userId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    return NextResponse.json(
      {
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          color: g.color,
          bookmarkCount: g._count.bookmarks,
        })),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension groups fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500, headers: corsHeaders }
    );
  }
}

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

    const user = await db.user.findUnique({
      where: { id: result.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500, headers: corsHeaders }
    );
  }
}

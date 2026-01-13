import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiToken } from "@/server/utils/api-token-validation";
import { getUrlMetadata } from "@/lib/url-metadata";
import { normalizeUrl } from "@/lib/utils";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { url, title, description, favicon, groupId } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let targetGroupId = groupId;

    if (!targetGroupId) {
      const defaultGroup = await db.group.findFirst({
        where: { userId: result.userId },
        orderBy: { createdAt: "asc" },
      });

      if (!defaultGroup) {
        const newGroup = await db.group.create({
          data: {
            name: "Bookmarks",
            color: "#74B06F",
            userId: result.userId,
          },
        });
        targetGroupId = newGroup.id;
      } else {
        targetGroupId = defaultGroup.id;
      }
    }

    const normalizedUrl = normalizeUrl(url);
    let bookmarkTitle = title;
    let bookmarkFavicon = favicon || null;

    if (!bookmarkFavicon || !bookmarkTitle) {
      const metadata = await getUrlMetadata(normalizedUrl);
      if (!bookmarkFavicon && metadata.favicon) {
        bookmarkFavicon = metadata.favicon;
      }
      if (!bookmarkTitle && metadata.title) {
        bookmarkTitle = metadata.title;
      }
    }

    if (!bookmarkTitle) {
      bookmarkTitle = new URL(normalizedUrl).hostname;
    }

    const bookmark = await db.bookmark.create({
      data: {
        title: bookmarkTitle,
        url: normalizedUrl,
        favicon: bookmarkFavicon,
        type: "link",
        groupId: targetGroupId,
        userId: result.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        bookmark: {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          favicon: bookmark.favicon,
          groupId: bookmark.groupId,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension bookmark save error:", error);
    return NextResponse.json(
      { error: "Failed to save bookmark" },
      { status: 500, headers: corsHeaders }
    );
  }
}

import { apiTokenAuthed } from "../context";
import { db } from "@/lib/db";
import { extensionSaveBookmarkSchema } from "@/lib/schema";
import { getUrlMetadata } from "@/lib/url-metadata";
import { normalizeUrl } from "@/lib/utils";

export const extensionSaveBookmark = apiTokenAuthed
  .input(extensionSaveBookmarkSchema)
  .handler(async ({ context, input }) => {
    let groupId = input.groupId;

    if (!groupId) {
      const defaultGroup = await db.group.findFirst({
        where: { userId: context.user.id },
        orderBy: { createdAt: "asc" },
      });

      if (!defaultGroup) {
        const newGroup = await db.group.create({
          data: {
            name: "Bookmarks",
            color: "#74B06F",
            userId: context.user.id,
          },
        });
        groupId = newGroup.id;
      } else {
        groupId = defaultGroup.id;
      }
    }

    const normalizedUrl = normalizeUrl(input.url);
    let title = input.title;
    let favicon = input.favicon || null;

    if (!favicon) {
      const metadata = await getUrlMetadata(normalizedUrl);
      if (metadata.favicon) {
        favicon = metadata.favicon;
      }
      if (!title && metadata.title) {
        title = metadata.title;
      }
    }

    const bookmark = await db.bookmark.create({
      data: {
        title,
        url: normalizedUrl,
        favicon,
        type: "link",
        groupId,
        userId: context.user.id,
      },
    });

    return bookmark;
  });

export const extensionGetGroups = apiTokenAuthed.handler(async ({ context }) => {
  const groups = await db.group.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    color: g.color,
    bookmarkCount: g._count.bookmarks,
  }));
});

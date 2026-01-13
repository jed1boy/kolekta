import { authed } from "../context";
import { db } from "@/lib/db";

export const deleteAccount = authed.handler(async ({ context }) => {
  // Delete user will cascade to all related data (sessions, accounts, bookmarks, groups)
  // based on Prisma schema "onDelete: Cascade"
  await db.user.delete({
    where: { id: context.user.id },
  });

  return { success: true };
});

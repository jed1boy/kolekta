import { ORPCError, os } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateApiToken } from "./utils/api-token-validation";
import type { Session, User } from "@/lib/schema";

export const base = os.use(async ({ next }) => {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session;

  return next({
    context: {
      session,
      user: session?.user ?? null,
    },
  });
});

export const authed = base.use(({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      ...context,
      user: context.user,
    },
  });
});

// API Token authentication middleware for extension
export const apiTokenBase = os.use(async ({ next }) => {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  let user: User | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const result = await validateApiToken(token);

    if (result) {
      const dbUser = await db.user.findUnique({
        where: { id: result.userId },
      });

      if (dbUser) {
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          emailVerified: dbUser.emailVerified,
          image: dbUser.image,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
      }
    }
  }

  return next({
    context: {
      user,
    },
  });
});

export const apiTokenAuthed = apiTokenBase.use(({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      ...context,
      user: context.user,
    },
  });
});

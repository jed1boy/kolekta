import { randomBytes, createHash } from "crypto";
import { authed } from "../context";
import { db } from "@/lib/db";
import { generateTokenSchema, revokeTokenSchema } from "@/lib/schema";
import { validateApiToken } from "../utils/api-token-validation";

const TOKEN_PREFIX = "kolekta_";

function generateTokenString(): string {
  const randomPart = randomBytes(32).toString("hex");
  return `${TOKEN_PREFIX}${randomPart}`;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getTokenPrefix(token: string): string {
  return token.substring(0, 16) + "...";
}

export const generateToken = authed
  .input(generateTokenSchema)
  .handler(async ({ context, input }) => {
    const plainToken = generateTokenString();
    const hashedToken = hashToken(plainToken);
    const prefix = getTokenPrefix(plainToken);

    const apiToken = await db.apiToken.create({
      data: {
        token: hashedToken,
        prefix,
        name: input.name || null,
        userId: context.user.id,
      },
    });

    return {
      id: apiToken.id,
      token: plainToken,
      name: apiToken.name,
      prefix,
      createdAt: apiToken.createdAt.toISOString(),
    };
  });

export const listTokens = authed.handler(async ({ context }) => {
  const tokens = await db.apiToken.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });

  return tokens.map((t) => ({
    id: t.id,
    name: t.name,
    prefix: t.prefix,
    lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
  }));
});

export const revokeToken = authed
  .input(revokeTokenSchema)
  .handler(async ({ context, input }) => {
    await db.apiToken.delete({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    });

    return { success: true };
  });

// validateApiToken moved to server/utils/api-token-validation.ts to avoid circular dependency

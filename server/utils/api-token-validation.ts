import { createHash } from "crypto";
import { db } from "@/lib/db";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function validateApiToken(
  token: string
): Promise<{ userId: string } | null> {
  const hashedToken = hashToken(token);

  const apiToken = await db.apiToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!apiToken) {
    return null;
  }

  await db.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  });

  return { userId: apiToken.userId };
}

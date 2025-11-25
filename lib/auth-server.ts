import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";
import type { Session } from "./schema";

export async function getSession(): Promise<Session | null> {
  const headersList = await headers();
  const session = (await auth.api.getSession({
    headers: headersList,
  })) as Session | null;

  return session;
}

import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { router } from "@/server";

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error: unknown) => {
      console.error("[RPC Error]", error);
      if (error instanceof Error) {
        console.error("[RPC Error Stack]", error.stack);
      }
    }),
  ],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/rpc",
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;

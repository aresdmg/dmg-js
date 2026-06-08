import { ConnectDB } from "@/db";
import { initTRPC } from "@trpc/server";
import { NextRequest } from "next/server";
import superjson from "superjson";

export const serverContext = async (opts: { req: Request }) => {
    const req = opts.req as NextRequest;
    const db = await ConnectDB()
    return {
        req,
        db
    };
};

export type Context = Awaited<ReturnType<typeof serverContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

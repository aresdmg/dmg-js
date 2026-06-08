import { ConnectDB } from "@/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { NextRequest } from "next/server";
import superjson from "superjson";
import jwt from "jsonwebtoken";
import { JwtUserPayload } from "@/types/user";

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

const isAuthed = t.middleware(({ ctx, next }) => {
    const jwtToken = ctx.req.cookies.get("dmg_access_token")?.value
    if (!jwtToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
        throw new Error("JWT_SECRET not set")
    }

    const decodedToken = jwt.verify(jwtToken, jwtSecret) as JwtUserPayload

    return next({
        ctx: {
            ...ctx,
            user: { ...decodedToken }
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed)

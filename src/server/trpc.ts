import { ConnectDB } from "@/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { NextRequest } from "next/server";
import superjson from "superjson";
import jwt from "jsonwebtoken";
import { JwtUserPayload } from "@/types/user";
import { generateAccessToken, hashRefreshToken } from "@/lib/token";
import { tokensTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { email } from "zod";
import { cookies } from "next/headers";

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

const isAuthed = t.middleware(async ({ ctx, next }) => {
    const accessToken = ctx.req.cookies.get("dmg_access_token")?.value
    const refreshToken = ctx.req.cookies.get("dmg_refresh_token")?.value

    let user: JwtUserPayload | null = null
    let newAccessToken

    try {
        if (accessToken) {
            user = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtUserPayload
        }
    } catch (error) {
        if (!(error instanceof jwt.TokenExpiredError)) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
    }

    if (!user && refreshToken) {
        const hashedRefreshToken = hashRefreshToken(refreshToken)
        let [exitingUser] = await ctx.db
            .select({
                token: tokensTable,
                user: usersTable
            })
            .from(tokensTable)
            .innerJoin(usersTable, eq(tokensTable.userId, usersTable.id))
            .where(
                and(
                    eq(tokensTable.refreshToken, hashedRefreshToken),
                    eq(tokensTable.revoked, false)
                )
            )
            .limit(1)

        if (!exitingUser) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        if (exitingUser.token.expiredAt < new Date()) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const newAccessTokenPayload = {
            id: exitingUser.user.id,
            name: exitingUser.user.fullName,
            email: exitingUser.user.email,
            role: exitingUser.user.role
        } as JwtUserPayload

        newAccessToken = generateAccessToken(newAccessTokenPayload)
        user = newAccessTokenPayload
        const cs = await cookies()
        cs.set("dmg_access_token", newAccessToken, { maxAge: 60 * 15, sameSite: "lax" })
    }

    if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
        ctx: {
            ...ctx,
            user: { ...user }
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed)

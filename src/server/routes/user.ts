import { findSchema, JwtUserPayload, loginSchema, registerSchema, updateAvatarSchema } from "@/types/user";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { tokensTable, usersTable } from "@/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/token";
import { cookies } from "next/headers";

export const userRouter = router({
    register: publicProcedure
        .input(registerSchema)
        .mutation(
            async ({ ctx, input }) => {
                const { fullName, email, password } = input
                if (!fullName || !email || !password) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Missing information" })
                }

                const [existingUser] = await ctx.db
                    .select({
                        id: usersTable.id,
                        email: usersTable.email
                    })
                    .from(usersTable)
                    .where(
                        eq(usersTable.email, email)
                    )
                    .limit(1)

                if (existingUser) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Email is taken" })
                }

                const hashedPassword = await bcrypt.hash(password, 12)

                const [createdUser] = await ctx.db
                    .insert(usersTable)
                    .values({
                        email,
                        fullName,
                        password: hashedPassword
                    })
                    .returning()

                if (!createdUser) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User creation failed" })
                }

                return createdUser
            }
        ),

    login: publicProcedure
        .input(loginSchema)
        .mutation(
            async ({ ctx, input }) => {
                const { email, password } = input
                if (!email || !password) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Missing information" })
                }

                const [user] = await ctx.db
                    .select({
                        id: usersTable.id,
                        fullName: usersTable.fullName,
                        email: usersTable.email,
                        password: usersTable.password,
                        role: usersTable.role,
                        isNew: usersTable.isNew,
                        avatar: usersTable.avatar
                    })
                    .from(usersTable)
                    .where(
                        eq(usersTable.email, email)
                    )
                    .limit(1)

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
                }

                const isValidPassword = await bcrypt.compare(password, user.password as string)
                if (!isValidPassword) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid credentials" })
                }

                const jwtPayload = {
                    id: user.id,
                    name: user.fullName,
                    email: user.email,
                    role: user.role
                } as JwtUserPayload

                const accessToken = generateAccessToken(jwtPayload)
                const refreshToken = generateRefreshToken()
                const hashedRefreshToken = hashRefreshToken(refreshToken)

                await ctx.db.transaction(async tx => {
                    await tx.insert(tokensTable).values({
                        userId: user.id,
                        refreshToken: hashedRefreshToken,
                        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    })
                })

                const cs = await cookies()
                cs.set("dmg_access_token", accessToken, { maxAge: 60 * 15, sameSite: "lax" })
                cs.set("dmg_refresh_token", refreshToken, { maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })

                return { success: true, data: { isNew: user.isNew } }
            }
        ),

    logout: protectedProcedure
        .mutation(
            async ({ ctx }) => {
                const user = ctx.user
                const refreshToken = ctx.req.cookies.get("dmg_refresh_token")?.value

                if (!user || !refreshToken) {
                    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized request" })
                }

                const hashedRefreshToken = hashRefreshToken(refreshToken)
                await ctx.db
                    .update(tokensTable)
                    .set({
                        revoked: true
                    })
                    .where(
                        and(
                            eq(tokensTable.userId, user.id),
                            eq(tokensTable.refreshToken, hashedRefreshToken),
                            eq(tokensTable.revoked, false)
                        )
                    )

                const cs = await cookies()
                cs.delete("dmg_access_token")
                cs.delete("dmg_refresh_token")

                return { success: true }
            }
        ),

    updateAvatar: protectedProcedure
        .input(updateAvatarSchema)
        .mutation(
            async ({ ctx, input }) => {
                if (!ctx.user) {
                    throw new TRPCError({ code: "UNAUTHORIZED" })
                }

                if (!input.url) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save avatar" })
                }

                const [user] = await ctx.db
                    .update(usersTable)
                    .set({
                        avatar: input.url,
                        isNew: false,
                        updatedAt: new Date(Date.now())
                    })
                    .where(
                        and(
                            eq(usersTable.id, ctx.user.id),
                            eq(usersTable.email, ctx.user.email)
                        )
                    )
                    .returning()

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
                }

                const formattedUser = {
                    id: user.id,
                    email: user.email,
                    avatar: user.avatar
                }

                return { success: true, user: formattedUser }
            }
        ),

    me: protectedProcedure
        .query(
            async ({ ctx }) => {
                if (!ctx.user) {
                    throw new TRPCError({ code: "UNAUTHORIZED" })
                }

                const [user] = await ctx.db
                    .select({
                        id: usersTable.id,
                        name: usersTable.fullName,
                        email: usersTable.email,
                        role: usersTable.role,
                        avatar: usersTable.avatar,
                        isNew: usersTable.isNew
                    })
                    .from(usersTable)
                    .where(
                        and(
                            eq(usersTable.id, ctx.user.id),
                            eq(usersTable.email, ctx.user.email)
                        )
                    )
                    .limit(1)

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
                }

                return user
            }
        ),

    find: protectedProcedure
        .input(findSchema)
        .query(
            async ({ ctx, input }) => {
                const query = input.query.trim()
                if (!query) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Query not found" })
                }

                if (query.length < 2) {
                    return [];
                }

                const users = await ctx.db
                    .select(
                        {
                            id: usersTable.id,
                            name: usersTable.fullName,
                            avatar: usersTable.avatar
                        }
                    )
                    .from(usersTable)
                    .where(
                        or(
                            ilike(usersTable.email, `%${query}%`),
                            ilike(usersTable.fullName, `%${query}%`)
                        )
                    )
                    .limit(10)
                    .orderBy(usersTable.fullName)

                if (!users.length) {
                    return [];
                }

                return users
            }
        )
})

import { loginSchema, registerSchema } from "@/types/user";
import { publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { tokensTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/token";
import { cookies } from "next/headers";

export const userRoute = router({
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
                        email: usersTable.fullName,
                        password: usersTable.password,
                        role: usersTable.role,
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
                    throw new TRPCError({ code: "BAD_REQUEST", message: "INvalid credentials" })
                }

                const jwtPayload = {
                    id: user.id,
                    name: user.fullName,
                    email: user.email,
                    role: user.role
                }

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
                cs.set("dmg_access_token", accessToken, { secure: true, maxAge: 60 * 15, sameSite: "lax" })
                cs.set("dmg_refresh_token", refreshToken, { secure: true, maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })

                return { message: "User authenticated" }
            }
        ),
})

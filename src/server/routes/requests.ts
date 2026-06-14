import { createSchema } from "@/types/requests";
import { protectedProcedure, router } from "../trpc";
import { requestsTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const requestRouter = router({
    create: protectedProcedure
        .input(createSchema)
        .mutation(
            async ({ ctx, input }) => {
                if (!ctx.user) {
                    throw new TRPCError({ code: "UNAUTHORIZED" })
                }

                const [existingReq] = await ctx.db
                    .select()
                    .from(requestsTable)
                    .where(
                        and(
                            eq(requestsTable.fromUser, ctx.user.id),
                            eq(requestsTable.toUser, input.to)
                        )
                    )

                if (existingReq) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Request exists" })
                }

                const [fromUser] = await ctx.db
                    .select({
                        id: usersTable.id
                    })
                    .from(usersTable)
                    .where(
                        eq(usersTable.id, ctx.user.id)
                    )
                    .limit(1)

                const [toUser] = await ctx.db
                    .select({
                        id: usersTable.id
                    })
                    .from(usersTable)
                    .where(
                        eq(usersTable.id, input.to)
                    )

                if (!fromUser) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "from user not found" })
                }

                if (!toUser) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "to user not found" })
                }

                const [createdRequest] = await ctx.db
                    .insert(requestsTable)
                    .values({
                        fromUser: fromUser.id,
                        toUser: toUser.id,
                    })
                    .returning()

                if (!createdRequest) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send request" })
                }

                return createdRequest
            }
        )
})
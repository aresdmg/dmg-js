import { uuid, pgTable, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password"),
    avatar: text("avatar").notNull().default("https://res.cloudinary.com/desamhhkj/image/upload/v1774217400/avatar0_jntvgv.jpg"),
    isNew: boolean("is_new").default(true),
    role: varchar("role", { length: 20 }).$type<"USER" | "ADMIN">().default("USER").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" })
});

export const tokensTable = pgTable("tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
    refreshToken: varchar("refresh_token", { length: 255 }).notNull(),
    revoked: boolean("revoked").default(false).notNull(),
    expiredAt: timestamp("expired_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
})
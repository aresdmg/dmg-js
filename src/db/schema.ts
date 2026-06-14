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

export const requestsTable = pgTable("requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    fromUser: uuid("from_user").references(() => usersTable.id, { onDelete: "cascade" }),
    toUser: uuid("to_user").references(() => usersTable.id, { onDelete: "cascade" }),
    accepted: boolean("is_accepted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
})

export const channelsTable = pgTable("channels", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    isGroup: boolean("is_group").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" })
})

export const membersTable = pgTable("members", {
    id: uuid("id").defaultRandom().primaryKey(),
    channelId: uuid("channel_id").references(() => channelsTable.id, { onDelete: "cascade" }),
    member: uuid("member").references(() => usersTable.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 30 }).$type<"MEMBER" | "ADMIN">().default("MEMBER").notNull(),
})
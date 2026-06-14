import z from "zod";

export const createSchema = z.object({
    to: z.uuid()
})

export type Create = z.infer<typeof createSchema>
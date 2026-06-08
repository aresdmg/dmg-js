import z, { email } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(1, { error: "Min character limit is 100" }).max(100, { error: "Max character limit is 100" }).nonempty(),
    email: z.email().nonempty(),
    password: z.string()
})

export const loginSchema = z.object({
    email: z.email().nonempty(),
    password: z.string()
})

export type Register = z.infer<typeof registerSchema>
export type Login = z.infer<typeof loginSchema>
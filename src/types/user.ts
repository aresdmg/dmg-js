import { Jwt } from "jsonwebtoken";
import z from "zod";

export interface JwtUserPayload extends Jwt {
    id: string,
    name: string,
    email: string,
    role: "USER" | "ADMIN"
}

export const registerSchema = z.object({
    fullName: z.string().min(1, { error: "Min character limit is 1" }).max(100, { error: "Max character limit is 100" }).nonempty(),
    email: z.email().nonempty(),
    password: z.string().min(6, "Password must be 6 character long")
})

export const loginSchema = z.object({
    email: z.email().nonempty(),
    password: z.string()
})

export const updateAvatarSchema = z.object({
    url: z.string().nonempty()
})

export type Register = z.infer<typeof registerSchema>
export type Login = z.infer<typeof loginSchema>
export type UpdateAvatar = z.infer<typeof updateAvatarSchema>
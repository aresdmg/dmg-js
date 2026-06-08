import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const generateAccessToken = (user: { id: string, name: string, email: string, role: "USER" | "ADMIN" }) => {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
        throw new Error("JWT_SECRET not set")
    }

    const accessToken = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        jwtSecret,
        {
            expiresIn: "15m"
        }
    )

    return accessToken;
}

export const generateRefreshToken = () => {
    return crypto.randomBytes(128).toString("hex")
}

export const hashRefreshToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex")
}
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})

export async function POST(req: NextRequest) {
    const formData = await req.formData()

    const file = formData.get("avatar") as File
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`;

    const res = await cloudinary.uploader.upload(dataUri, {
        resource_type: "image",
        folder: "dmg"
    })

    return NextResponse.json({
        url: res.secure_url,
        publicId: res.public_id,
    })

}
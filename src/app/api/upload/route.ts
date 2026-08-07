// Cloudinary's Node SDK requires the Node.js runtime (Buffer/streams).
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
    }

    const url = await uploadToCloudinary(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

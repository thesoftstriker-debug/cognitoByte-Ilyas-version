import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { name, email, note, source = "chatbot" } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    await db.collection("Contact Us").insertOne({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: note ? `Chatbot lead inquiry: ${note}` : "Chatbot lead capture",
      service: "Chatbot Inquiry",
      source,
      status: "new",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Lead captured successfully." });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to save lead." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const hashed = hashPassword(password);
    const result = await createUser({ name, email, password: hashed, role: "user" });
    const token = signToken({ userId: result.insertedId.toString(), role: "user" });
    const response = NextResponse.json(
      { message: "Account created", token, user: { id: result.insertedId, name, email, role: "user" } },
      { status: 201 }
    );
    response.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch (error) {
    console.error("Register error:", error);
    const message = process.env.NODE_ENV === "development"
      ? `Internal server error: ${error instanceof Error ? error.message : String(error)}`
      : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

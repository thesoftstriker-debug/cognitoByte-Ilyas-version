import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUserById } from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = request.cookies.get("token")?.value;
  return cookie || null;
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: ("user" | "admin")[]
) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const user = await findUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  if (allowedRoles && !allowedRoles.includes(user.role as "user" | "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { ...payload, role: user.role };
}

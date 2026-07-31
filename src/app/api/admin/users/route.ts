import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findAllUsers, updateUserRole, deleteUserById } from "@/lib/models/User";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await findAllUsers(search, page, limit);
  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { id, role } = await request.json();
  if (!id || !role) {
    return NextResponse.json({ error: "Missing id or role" }, { status: 400 });
  }
  await updateUserRole(id, role);
  return NextResponse.json({ message: "Role updated" });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await deleteUserById(id);
  return NextResponse.json({ message: "User deleted" });
}

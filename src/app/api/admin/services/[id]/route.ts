import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findServiceById, updateService, deleteServiceById } from "@/lib/models/Service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const service = await findServiceById(params.id);
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  return NextResponse.json(service);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    await updateService(params.id, body);
    return NextResponse.json({ message: "Service updated" });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  await deleteServiceById(params.id);
  return NextResponse.json({ message: "Service deleted" });
}

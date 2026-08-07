import { NextResponse } from "next/server";

export async function GET() {
  const number = process.env.WHATSAPP_NUMBER || "";
  return NextResponse.json({ whatsapp: number });
}
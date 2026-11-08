import { NextResponse } from "next/server";
import { getTodayVisits } from "@/lib/models/Visit";

export const revalidate = 30;

export async function GET() {
  try {
    const stats = await getTodayVisits();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ totalToday: 0 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMongoDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const db = await getMongoDb();

    const [totalProducts, totalServices, totalUsers, orders] = await Promise.all([
      db.collection("products").countDocuments(),
      db.collection("services").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("orders").find({}).sort({ createdAt: -1 }).toArray(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === "pending" || !o.status).length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalProducts,
        totalServices,
        totalUsers,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}

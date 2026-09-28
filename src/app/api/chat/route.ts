import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getBlogPosts, getPricingFromDb, getProjectsFromDb, getServicesFromDb } from "@/lib/data";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { getMongoDb } from "@/lib/mongodb";

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is missing");
  return new Groq({ apiKey: key });
}

/* ─────────────────────────────────────────────
   PUBLIC SYSTEM PROMPT  (normal users)
───────────────────────────────────────────── */
const USER_SYSTEM_PROMPT = `You are a helpful AI assistant for CognitoByte, an AI automation agency.

You ONLY answer questions about CognitoByte's services, pricing, projects, blog posts, process, and team.

If someone asks something unrelated to CognitoByte (e.g., general coding questions, personal advice, other companies), politely say: "I'm trained specifically to help with questions about CognitoByte. For that topic, I'd suggest a general search engine. Is there anything about our services or pricing I can help with?"

Keep answers concise, helpful, and professional. Use bullet points when listing things.

KNOWLEDGE BASE:
{knowledge}`;

/* ─────────────────────────────────────────────
   ADMIN SYSTEM PROMPT  (full data access)
───────────────────────────────────────────── */
const ADMIN_SYSTEM_PROMPT = `You are an intelligent admin assistant for CognitoByte. You have FULL access to all live website data.

You help the admin understand business metrics, sales data, product performance, order details, user activity, and website content at a glance.

Keep answers SHORT, data-focused, and direct. Use bullet points and numbers. Format currency as USD.

When asked about revenue, orders, products, users, blogs, services, pricing, projects, or coupons — answer using the LIVE DATA provided below.

LIVE ADMIN DATA:
{adminData}

PUBLIC KNOWLEDGE BASE:
{knowledge}`;

/* ─────────────────────────────────────────────
   Build public knowledge base
───────────────────────────────────────────── */
async function buildKnowledge(): Promise<string> {
  const [services, pricing, projects, blog] = await Promise.all([
    getServicesFromDb(), getPricingFromDb(), getProjectsFromDb(), getBlogPosts(),
  ]);

  let knowledge = "SERVICES:\n";
  if (services?.length) {
    knowledge += services.map((s: any) => {
      const features = s.features?.length ? `\n  Features: ${s.features.join(", ")}` : "";
      return `- ${s.title}: ${s.shortDescription || ""}${features}`;
    }).join("\n");
  }

  knowledge += "\n\nPRICING:\n";
  if (pricing?.length) {
    knowledge += pricing.map((p: any) => {
      const features = p.features?.length ? `\n  Includes: ${p.features.join(", ")}` : "";
      return `- ${p.name}: ${p.price || "Custom"}${p.period || ""} — ${p.description || ""}${features}`;
    }).join("\n");
  }

  knowledge += "\n\nPROCESS:\n1. Discovery Call (free)\n2. Workflow Design\n3. Build & Test\n4. Handoff\n5. Support";

  knowledge += "\n\nRECENT PROJECTS:\n";
  if (projects?.length) {
    projects.slice(0, 5).forEach((p: any) => {
      knowledge += `- ${p.title} (${p.category || "N/A"}): ${p.shortDescription || ""}\n`;
    });
  }

  knowledge += "\n\nBLOG POSTS:\n";
  if (blog?.length) {
    blog.slice(0, 5).forEach((b: any) => {
      knowledge += `- ${b.title}: ${b.excerpt || ""}\n`;
    });
  }

  knowledge += "\n\nCONTACT:\nEmail: automations@cognitobyte.com";

  return knowledge;
}

/* ─────────────────────────────────────────────
   Build ADMIN live data context
───────────────────────────────────────────── */
async function buildAdminData(): Promise<string> {
  try {
    const db = await getMongoDb();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [orders, products, users, blogs, services, projects, pricing, coupons] = await Promise.all([
      db.collection("orders").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("products").find({}).toArray(),
      db.collection("users").find({}, { projection: { password: 0 } }).toArray(),
      db.collection("blogs").find({}).toArray(),
      db.collection("services").find({}).toArray(),
      db.collection("projects").find({}).toArray(),
      db.collection("pricing").find({}).toArray(),
      db.collection("coupons").find({}).toArray(),
    ]);

    // Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const monthlyOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Order status breakdown
    const pending = orders.filter(o => !o.status || o.status === "pending").length;
    const processing = orders.filter(o => o.status === "processing").length;
    const completed = orders.filter(o => o.status === "completed" || o.status === "delivered").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;

    // Top selling products
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity || 1;
        productSales[item.productId].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders.slice(0, 5).map(o => ({
      id: o._id?.toString().slice(-6),
      buyer: o.userName || o.userEmail,
      total: o.total,
      status: o.status || "pending",
      date: new Date(o.createdAt).toLocaleDateString(),
    }));

    let data = `📊 BUSINESS OVERVIEW (Live Data as of ${now.toLocaleDateString()})\n\n`;

    data += `REVENUE:\n`;
    data += `- Total all-time revenue: $${totalRevenue.toFixed(2)}\n`;
    data += `- This month's revenue: $${monthlyRevenue.toFixed(2)}\n`;
    data += `- Orders this month: ${monthlyOrders.length}\n\n`;

    data += `ORDERS:\n`;
    data += `- Total orders: ${orders.length}\n`;
    data += `- Pending: ${pending} | Processing: ${processing} | Completed: ${completed} | Cancelled: ${cancelled}\n\n`;

    data += `TOP SELLING PRODUCTS:\n`;
    if (topProducts.length) {
      topProducts.forEach((p, i) => {
        data += `${i + 1}. ${p.name} — ${p.qty} sold — $${p.revenue.toFixed(2)} revenue\n`;
      });
    } else {
      data += "- No product sales yet\n";
    }

    data += `\nRECENT ORDERS:\n`;
    recentOrders.forEach(o => {
      data += `- #${o.id} | ${o.buyer} | $${(o.total || 0).toFixed(2)} | ${o.status} | ${o.date}\n`;
    });

    data += `\nCONTENT COUNTS:\n`;
    data += `- Products: ${products.length} (${products.filter((p: any) => p.isActive).length} active)\n`;
    data += `- Services: ${services.length}\n`;
    data += `- Projects: ${projects.length}\n`;
    data += `- Blog posts: ${blogs.length}\n`;
    data += `- Pricing plans: ${pricing.length}\n`;
    data += `- Users registered: ${users.length}\n`;
    data += `- Coupons: ${coupons.length} (${coupons.filter((c: any) => c.isActive).length} active)\n`;

    data += `\nALL PRODUCTS:\n`;
    products.forEach((p: any) => {
      data += `- ${p.name} | $${p.price} | ${p.category} | ${p.isActive ? "Active" : "Inactive"}\n`;
    });

    data += `\nALL USERS:\n`;
    users.slice(0, 20).forEach((u: any) => {
      data += `- ${u.name || "N/A"} | ${u.email} | ${u.role} | Joined: ${new Date(u.createdAt || Date.now()).toLocaleDateString()}\n`;
    });

    data += `\nACTIVE COUPONS:\n`;
    coupons.filter((c: any) => c.isActive).forEach((c: any) => {
      data += `- ${c.code} | ${c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`}\n`;
    });

    return data;
  } catch (err) {
    console.error("Admin data build error:", err);
    return "Error loading live admin data.";
  }
}

/* ─────────────────────────────────────────────
   POST handler
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Check if caller is admin
    const token = getTokenFromRequest(req);
    const payload = token ? verifyToken(token) : null;
    const isAdmin = payload?.role === "admin";

    const knowledge = await buildKnowledge();
    let systemPrompt: string;

    if (isAdmin) {
      const adminData = await buildAdminData();
      systemPrompt = ADMIN_SYSTEM_PROMPT
        .replace("{adminData}", adminData)
        .replace("{knowledge}", knowledge);
    } else {
      systemPrompt = USER_SYSTEM_PROMPT.replace("{knowledge}", knowledge);
    }

    const recentMessages = messages.slice(-10);

    let message: string;
    try {
      const groq = getGroq();
      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        max_tokens: isAdmin ? 800 : 500,
        temperature: 0.5,
      });
      message = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } catch {
      message = "I'm currently offline for maintenance. Please email us at hello@cognitobyte.com and we'll get back to you shortly!";
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

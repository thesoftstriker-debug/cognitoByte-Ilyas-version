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
const USER_SYSTEM_PROMPT = `You are the knowledgeable AI assistant for CognitoByte (https://cognitobyte.com), an agency specializing in AI Automation, Autonomous Agents, Custom Chatbots, and Full-Stack Web Development.

YOUR EXPERTISE & CAPABILITIES:
1. Full-Stack Web Development:
   - Next.js 14 (App Router), React, MERN stack (MongoDB, Express, React, Node.js), TypeScript, Tailwind CSS, Shadcn UI.
   - Authentication (Clerk, JWT, Bcrypt), Cloud databases (MongoDB Atlas, MySQL on Aiven Cloud).
   - Real-time WebSockets (Socket.io), background job workers (Inngest), payment gateways (Stripe), and media hosting (Cloudinary).
   - Automated QA and BDD testing frameworks (Puppeteer, Cucumber.js, Gherkin).
   - Key Web Development Projects:
     * Pharma-Ease: Full-stack MERN + Next.js pharmacy e-commerce with Groq AI medicine recommendations, Stripe checkout, Inngest background jobs.
     * IlyasKaGpt: 100% offline, on-device serverless AI assistant running quantized local LLMs & VLMs directly in the browser via WebGPU/Wasm with zero internet needed.
     * Full-Stack MERN E-Commerce Platform: Scalable store with Stripe, JWT auth, Redux Toolkit, MongoDB, Tailwind CSS.
     * Al-Shifa Hospital Platform: Healthcare management system using Next.js, MySQL (Aiven Cloud), Bcrypt auth, Cloudinary medical hosting.
     * Web Testing Tool: Automated BDD QA testing tool using Puppeteer and Cucumber.js/Gherkin with Clerk auth.
     * E-Commerce Store Hub: Premium MERN + Shadcn UI storefront with Clerk auth, Redux Toolkit, and multi-API integrations.
     * Social Media Networking App: Real-time social platform with Socket.io messaging, stories, and an admin customer support dashboard.

2. AI Automation & Workflow Orchestration:
   - Complex n8n pipelines, custom API connectors, CRM sync, auto-retry logic, and zero-touch operations.
   - Key Automation Projects:
     * LinkedIn Automation Engine: AI-driven content generation, hook optimization, and automated scheduling.
     * Multi-Platform Social Media Automation: Cross-platform content pipeline publishing across Instagram, LinkedIn, and Facebook.
     * Intelligent AI Workflow Automation: End-to-end operation elimination for manual repetitive tasks.

3. Custom AI Agents & Chatbots:
   - WhatsApp Cloud API assistants, website chatbots, customer support routing, abandoned cart recovery, and COD confirmation.
   - Key Chatbot Project:
     * Raasid WhatsApp Automation System: WhatsApp bot for food brand with Roman Urdu NLP, 24/7 customer support, abandoned cart recovery (~30% recovery rate), COD order confirmation, and Google Sheets sync.

4. Pricing & Services:
   - Flexible pricing tiers (Starter Automation, Growth System, Enterprise Scale, and Custom Web Builds).
   - Free 30-minute discovery consultation to audit workflows and scope web development or automation needs.

RULES FOR ANSWERING:
- CORE REQUIREMENT: ALWAYS keep answers as SHORT and CLEAR as possible (under 3-5 bullet points or 2-3 brief sentences). Zero unnecessary fluff or essays.
- Answer questions directly and accurately using the knowledge base provided below.
- If asked about Web Development, MERN stack, Next.js, or web projects, concisely explain CognitoByte's full-stack capabilities and highlight relevant portfolio projects.
- CRITICAL FORMATTING RULE: NEVER generate raw markdown tables (| col | col |). Use compact, structured bullet points.
- Include links when helpful: [View Projects](/projects), [Explore Services](/services), [See Pricing](/pricing), [Book a Free Call](/contact).
- Format prices and technologies clearly in bold (e.g., **$499**, **Next.js 14**).
- If asked something unrelated to CognitoByte, politely redirect in one short sentence.

KNOWLEDGE BASE:
{knowledge}`;

/* ─────────────────────────────────────────────
   ADMIN SYSTEM PROMPT  (full data access)
───────────────────────────────────────────── */
const ADMIN_SYSTEM_PROMPT = `You are an intelligent admin assistant for CognitoByte with FULL live database access.

CORE REQUIREMENT: ALWAYS keep responses as SHORT, direct, and clear as possible (1 to 4 concise bullet points). Zero filler words. Format currency as USD.

STRICT FORMATTING RULES:
1. NEVER output raw markdown tables (| col | col |).
2. Format items cleanly using bold labels and compact bullets:
   • **Project/Item:** Name — key metric or status
3. Highlight critical numbers and metrics in bold (e.g., **$1,250.00**, **3 pending**, **12 active**).
4. Keep answers ultra-concise, high-signal, and easy to read instantly.

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

  let knowledge = "CORE SERVICES:\n";
  knowledge += "- Full-Stack Web Development: Modern Next.js 14, MERN Stack (MongoDB, Express, React, Node.js), TypeScript, Tailwind CSS, API integrations, real-time WebSockets, secure authentication (JWT, Clerk, Bcrypt), and cloud databases (MongoDB, MySQL/Aiven).\n";
  if (services?.length) {
    knowledge += services.map((s: any) => {
      const features = s.features?.length ? `\n  Features: ${s.features.join(", ")}` : "";
      return `- ${s.title}: ${s.shortDescription || ""}${features}`;
    }).join("\n");
  }

  knowledge += "\n\nALL PORTFOLIO PROJECTS (Grouped by Category):\n";
  if (projects?.length) {
    const webProjects = projects.filter((p: any) => p.category === "web-dev");
    const n8nProjects = projects.filter((p: any) => p.category === "n8n");
    const chatbotProjects = projects.filter((p: any) => p.category === "chatbot");
    const workflowProjects = projects.filter((p: any) => p.category === "workflow" || p.category === "ai-agent");

    if (webProjects.length) {
      knowledge += "\n--- Web Development Projects ---\n";
      webProjects.forEach((p: any) => {
        const tags = p.tags?.length ? ` [Tech: ${p.tags.join(", ")}]` : "";
        const results = p.results?.length ? ` (Results: ${p.results.map((r: any) => `${r.metric} ${r.label}`).join(", ")})` : "";
        knowledge += `* ${p.title}${tags}: ${p.shortDescription || p.description || ""}${results}\n`;
      });
    }

    if (n8nProjects.length) {
      knowledge += "\n--- n8n Automation Projects ---\n";
      n8nProjects.forEach((p: any) => {
        const tags = p.tags?.length ? ` [Tech: ${p.tags.join(", ")}]` : "";
        const results = p.results?.length ? ` (Results: ${p.results.map((r: any) => `${r.metric} ${r.label}`).join(", ")})` : "";
        knowledge += `* ${p.title}${tags}: ${p.shortDescription || p.description || ""}${results}\n`;
      });
    }

    if (chatbotProjects.length) {
      knowledge += "\n--- Chatbot & Messaging Projects ---\n";
      chatbotProjects.forEach((p: any) => {
        const tags = p.tags?.length ? ` [Tech: ${p.tags.join(", ")}]` : "";
        const results = p.results?.length ? ` (Results: ${p.results.map((r: any) => `${r.metric} ${r.label}`).join(", ")})` : "";
        knowledge += `* ${p.title}${tags}: ${p.shortDescription || p.description || ""}${results}\n`;
      });
    }

    if (workflowProjects.length) {
      knowledge += "\n--- Workflow & AI Agent Projects ---\n";
      workflowProjects.forEach((p: any) => {
        const tags = p.tags?.length ? ` [Tech: ${p.tags.join(", ")}]` : "";
        knowledge += `* ${p.title}${tags}: ${p.shortDescription || p.description || ""}\n`;
      });
    }
  }

  knowledge += "\n\nPRICING & PACKAGES:\n";
  if (pricing?.length) {
    knowledge += pricing.map((p: any) => {
      const features = p.features?.length ? `\n  Includes: ${p.features.join(", ")}` : "";
      return `- ${p.name}: ${p.price || "Custom"}${p.period ? ` / ${p.period}` : ""} — ${p.description || ""}${features}`;
    }).join("\n");
  } else {
    knowledge += "- Starter Automation: $499 (Single core pipeline, basic integrations)\n- Growth System: $1,299 (Multi-tool automation, AI chatbot, CRM sync)\n- Enterprise Custom: Custom scoping (Enterprise AI swarms, full-stack web applications, SLA support)\n";
  }

  knowledge += "\n\nWORKFLOW PROCESS:\n1. Free Discovery & Strategy Call (30 min)\n2. Architecture & Wireframe/Pipeline Design\n3. Agile Build & Rigorous Testing\n4. Deployment, Handoff & Dashboard Access\n5. Ongoing Telemetry & Support";

  knowledge += "\n\nBLOG & INSIGHTS:\n";
  if (blog?.length) {
    blog.slice(0, 5).forEach((b: any) => {
      knowledge += `- ${b.title}: ${b.excerpt || ""}\n`;
    });
  }

  knowledge += "\n\nCONTACT & CONSULTATION:\nEmail: automations@cognitobyte.com\nFree Strategy Session: Available via /contact";

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

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const monthlyOrders = orders.filter((o) => new Date(o.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const pending = orders.filter((o) => !o.status || o.status === "pending").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const completed = orders.filter((o) => o.status === "completed" || o.status === "delivered").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((order) => {
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

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o._id?.toString().slice(-6),
      buyer: o.userName || o.userEmail,
      total: o.total,
      status: o.status || "pending",
      date: new Date(o.createdAt).toLocaleDateString(),
    }));

    let data = `### 📊 Live Admin Telemetry\n*Live system metrics as of ${now.toLocaleDateString()}*\n\n`;
    data += `#### 💰 Revenue Overview\n`;
    data += `• **Total All-Time:** $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    data += `• **This Month:** $${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${monthlyOrders.length} orders)\n\n`;

    data += `#### 📦 Orders Summary (${orders.length} total)\n`;
    data += `• **Pending:** ${pending} | **Processing:** ${processing}\n`;
    data += `• **Completed:** ${completed} | **Cancelled:** ${cancelled}\n\n`;

    data += `#### 🏆 Top Selling Products\n`;
    if (topProducts.length) {
      topProducts.forEach((p, i) => {
        data += `**${i + 1}. ${p.name}**\n• ${p.qty} sold • **$${p.revenue.toFixed(2)}** revenue\n`;
      });
    } else {
      data += "• *No product sales yet.*\n";
    }

    data += `\n#### 🕒 Recent Orders\n`;
    if (recentOrders.length) {
      recentOrders.forEach((o) => {
        data += `• **Order #${o.id}** — ${o.buyer} • **$${(o.total || 0).toFixed(2)}** • \`${o.status}\` (${o.date})\n`;
      });
    } else {
      data += "• *No orders yet.*\n";
    }

    data += `\n#### 🗂️ Live Database Counts\n`;
    data += `• **Projects:** ${projects.length} (${projects.filter((p: any) => p.category === "web-dev").length} Web Dev, ${projects.filter((p: any) => p.category === "n8n").length} n8n, ${projects.filter((p: any) => p.category === "chatbot").length} Chatbots)\n`;
    data += `• **Products:** ${products.length} (${products.filter((p: any) => p.isActive).length} active)\n`;
    data += `- Services: ${services.length} | Blog posts: ${blogs.length} | Coupons: ${coupons.length}\n`;
    data += `• **Users Registered:** ${users.length}\n`;

    if (projects.length) {
      data += `\n#### 🚀 Active Projects List (${projects.length})\n`;
      projects.forEach((p: any, i: number) => {
        const cat = p.category === "web-dev" ? "Web Dev" : p.category === "n8n" ? "n8n" : p.category === "chatbot" ? "Chatbot" : "Workflow";
        const tags = p.tags?.length ? ` [${p.tags.slice(0, 3).join(", ")}]` : "";
        data += `**${i + 1}. [${p.title}](/projects/${p.slug})**\n• **Category:** ${cat}${tags}\n`;
      });
    }

    return data;
  } catch (err) {
    console.error("Admin data build error:", err);
    return "Error loading live admin data.";
  }
}

/* ─────────────────────────────────────────────
   Fallback Intelligent Responder
   (Guarantees accurate answers on all projects & web dev
   even if external LLM provider is offline or rate-limited)
───────────────────────────────────────────── */
function generateFallbackResponse(
  userQuery: string,
  projects: any[],
  services: any[],
  isAdmin: boolean,
  adminData: string
): string {
  const query = userQuery.toLowerCase().trim();

  if (isAdmin && (query.includes("revenue") || query.includes("order") || query.includes("user") || query.includes("stat") || query.includes("sale") || query.includes("admin") || query.includes("telemetry") || query.includes("metric"))) {
    return adminData;
  }

  // Web Development queries
  if (
    query.includes("web") ||
    query.includes("website") ||
    query.includes("mern") ||
    query.includes("next.js") ||
    query.includes("nextjs") ||
    query.includes("react") ||
    query.includes("frontend") ||
    query.includes("backend") ||
    query.includes("full stack") ||
    query.includes("fullstack") ||
    query.includes("develop")
  ) {
    const webProjects = projects.filter((p) => p.category === "web-dev");
    let response = `### 💻 Full-Stack Web Development\n\n`;
    response += `We build high-performance web applications using **Next.js 14**, **React**, **MERN Stack**, and **TypeScript**.\n\n`;
    response += `**Featured Projects:**\n`;
    if (webProjects.length) {
      webProjects.slice(0, 4).forEach((p) => {
        const tag = p.tags?.length ? ` (${p.tags.slice(0, 2).join(", ")})` : "";
        response += `• **[${p.title}](/projects/${p.slug})**${tag}\n`;
      });
    } else {
      response += `• **[Pharma-Ease](/projects/pharma-ease-pharmacy-platform)** (Next.js 14, Stripe)\n`;
      response += `• **[IlyasKaGpt](/projects/ilyaskagpt-offline-ai-assistant)** (Offline AI, WebGPU)\n`;
    }
    response += `\n[View all ${webProjects.length || 7} web projects](/projects) · [Book a free call](/contact)`;
    return response;
  }

  // Specific project queries
  if (query.includes("pharma") || query.includes("pharmacy")) {
    return `### 💊 Pharma-Ease\n\nFull-stack pharmacy platform built with **Next.js 14**, **MERN**, and **Stripe**:\n• **AI Medicine Recommendations:** Groq AI-powered suggestions.\n• **Background Jobs:** Automated inventory alerts via Inngest.\n\n[View Case Study](/projects/pharma-ease-pharmacy-platform) · [Book Call](/contact)`;
  }

  if (query.includes("ilyas") || query.includes("offline") || query.includes("on-device") || query.includes("gpt")) {
    return `### 🧠 IlyasKaGpt\n\n100% private, on-device AI assistant:\n• **Zero Network Calls:** Runs local quantized LLMs directly in-browser via WebGPU/Wasm.\n• **Privacy First:** Instant neural responses with zero cloud data transmission.\n\n[View Case Study](/projects/ilyaskagpt-offline-ai-assistant) · [Book Call](/contact)`;
  }

  if (query.includes("raasid") || query.includes("whatsapp") || query.includes("cod") || query.includes("cart recovery")) {
    return `### 📱 Raasid WhatsApp Automation\n\nE-commerce WhatsApp bot for food brands:\n• **Cart Recovery:** Recovers **~30%** of abandoned Shopify carts.\n• **COD Confirmation:** Interactive buttons cut fake orders by **60%**.\n• **24/7 Support:** Natural Roman Urdu and English NLP.\n\n[View Case Study](/projects/raasid-whatsapp-automation) · [Book Call](/contact)`;
  }

  if (query.includes("linkedin") || query.includes("social media") || query.includes("instagram") || query.includes("facebook")) {
    return `### 🚀 Social Media Automation\n\nAutonomous content pipelines via n8n & AI:\n• **LinkedIn Engine:** Platform-optimized thought leadership posts.\n• **Multi-Platform:** One-click publishing to Instagram, LinkedIn, and Facebook.\n\n[View Automation Projects](/projects) · [Book Call](/contact)`;
  }

  // All projects query
  if (query.includes("project") || query.includes("portfolio") || query.includes("work") || query.includes("case stud")) {
    const webCount = projects.filter((p) => p.category === "web-dev").length || 7;
    const n8nCount = projects.filter((p) => p.category === "n8n").length || 3;
    const botCount = projects.filter((p) => p.category === "chatbot").length || 1;

    let response = `### 🏆 CognitoByte Portfolio (${projects.length || 12} Projects)\n\n`;
    response += `• **Web Development (${webCount}):** Next.js 14, MERN Stack (Pharma-Ease, IlyasKaGpt, Al-Shifa, LMS)\n`;
    response += `• **n8n Automation (${n8nCount}):** Automated social pipelines & CRM sync\n`;
    response += `• **Chatbots (${botCount}):** WhatsApp & Web support bots\n\n`;
    response += `[Explore All Projects & Live Demos](/projects) · [Book a Free Call](/contact)`;
    return response;
  }

  // Services query
  if (query.includes("service") || query.includes("what do you do") || query.includes("what can you build") || query.includes("offer")) {
    return `### ⚡ CognitoByte Core Services\n\n• **Full-Stack Web Apps:** Next.js 14, MERN, React, TypeScript.\n• **Custom AI Chatbots:** WhatsApp & Web assistants with CRM sync.\n• **n8n Automation:** Connect tools & eliminate manual work.\n• **Autonomous AI Agents:** Multi-step business task execution.\n\n[View All Services](/services) · [Book Strategy Call](/contact)`;
  }

  // Pricing query
  if (query.includes("price") || query.includes("cost") || query.includes("package") || query.includes("how much")) {
    return `### 💳 Pricing Overview\n\n• **Starter Automation:** $499 (1 core workflow)\n• **Growth System:** $1,299 (Multi-tool pipeline + AI chatbot)\n• **Enterprise & Web:** Custom scoped\n\n*Includes a free 30-minute discovery call.*\n\n[View Pricing Plans](/pricing) · [Book Call](/contact)`;
  }

  // Contact / consultation query
  if (query.includes("contact") || query.includes("call") || query.includes("email") || query.includes("hire") || query.includes("book")) {
    return `### 📞 Get in Touch\n\n• **Free Call:** Book a 30-min discovery session on our [Contact Page](/contact).\n• **Email:** \`automations@cognitobyte.com\`\n• **Turnaround:** Guaranteed response within 24 hours.`;
  }

  // Default friendly response
  return `### Hello! Welcome to CognitoByte 👋\n\nWe build **Full-Stack Web Applications** (Next.js, MERN) and **AI Automations** (n8n, WhatsApp bots).\n\nAsk me about:\n• Our projects (Pharma-Ease, IlyasKaGpt)\n• Services or Pricing\n\n[Explore Projects](/projects) · [Book a Call](/contact)`;
}

/* ─────────────────────────────────────────────
   POST handler
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // Check if caller is admin
    const token = getTokenFromRequest(req);
    const payload = token ? verifyToken(token) : null;
    const isAdmin = payload?.role === "admin";

    const [knowledge, projects, services] = await Promise.all([
      buildKnowledge(),
      getProjectsFromDb(),
      getServicesFromDb(),
    ]);

    let adminData = "";
    let systemPrompt: string;

    if (isAdmin) {
      adminData = await buildAdminData();
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
      // Try primary Groq model: llama-3.3-70b-versatile
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        max_tokens: isAdmin ? 350 : 300,
        temperature: 0.3,
      });
      message = response.choices[0]?.message?.content || "";
      if (!message.trim()) throw new Error("Empty response from primary model");
    } catch {
      // Fallback: Try lighter Groq model (llama-3.1-8b-instant) if key is valid
      try {
        const groq = getGroq();
        const response2 = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            ...recentMessages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ],
          max_tokens: isAdmin ? 350 : 300,
          temperature: 0.3,
        });
        message = response2.choices[0]?.message?.content || "";
        if (!message.trim()) throw new Error("Empty response from secondary model");
      } catch {
        // Highly intelligent knowledge-driven fallback ensuring 100% uptime for Web Dev & Project queries
        message = generateFallbackResponse(lastUserMessage, projects, services, isAdmin, adminData);
      }
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      message: "I am ready to help with your web development and AI automation questions! Ask me about our projects (like Pharma-Ease or IlyasKaGpt), services, or pricing.",
    });
  }
}

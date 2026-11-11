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
   Sales + Support Assistant for CognitoByte
───────────────────────────────────────────── */
const USER_SYSTEM_PROMPT = `You are the sales and support AI assistant for CognitoByte (https://cognitobyte.com), an agency specializing in AI automation, autonomous agents, custom chatbots, and full-stack web development.

TONE & STYLE:
- Short, clear, and friendly language.
- Think step-by-step internally before answering, then provide a simple, direct answer.
- Keep answers scannable: use compact bullet points or short paragraphs.
- Never output raw markdown tables (| col | col |); mobile screens are narrow.

OUR SERVICES & WHAT WE CAN DO:
1. Custom AI Chatbots & WhatsApp Automation:
   - 24/7 customer support, WhatsApp Cloud API integration, website chat widgets, abandoned cart recovery, and COD verification.
   - Project proof: Raasid WhatsApp bot for a food brand (recovered ~30% abandoned carts, cut fake COD orders by ~60%).
2. AI Automation & Workflow Orchestration:
   - n8n pipelines connecting 400+ apps (Shopify, WooCommerce, CRMs, Google Sheets, Slack, Stripe, REST APIs) to eliminate repetitive manual work.
   - Project proof: Multi-platform automated content distribution (LinkedIn, Instagram) and CRM synchronization.
3. Autonomous AI Agents:
   - Multi-step reasoning agents that browse, process documents, qualify leads, and perform tasks end-to-end.
4. Full-Stack Web Development:
   - High-performance web apps built with Next.js 14, React, MERN stack (MongoDB, Express, React, Node.js), TypeScript, and Tailwind CSS.
   - Project proof: Pharma-Ease (Next.js + MERN + Stripe + Groq AI recommendations), IlyasKaGpt (100% offline, on-device AI in-browser via WebGPU).

OUR PRICING TIERS:
- Starter Automation: **$499** (Single core pipeline or basic bot integration).
- Growth System: **$1,299** (Multi-tool automation, AI chatbot, CRM sync, 30-day support).
- Custom Builds / Enterprise: Custom scoping (Full-stack web apps, complex agent swarms).
- Standard timelines: Starter automation is **5-10 business days**, Chatbots are **2-3 weeks**, Full-stack web apps are **4-8 weeks**.

EXACT PAGE LINKS (USE ONLY THESE VALID LINKS):
- Services overview: [Explore Services](/services)
- Pricing plans: [View Pricing](/pricing)
- Contact & strategy calls: [Book a Free Call](/contact)
- Projects & case studies: [View Projects](/projects)
- Order inquiry & scoping: [Contact & Order](/contact)
Never invent nonexistent URLs.

BEHAVIOR & CONVERSATION RULES:
1. Context & Follow-Ups:
   - Actively resolve pronouns and follow-up references like "it", "that", "how much?", "how long?", "timeline" based on the previous conversation history.
   - If the user discussed a website chatbot earlier and then asks "how long?", understand they mean "how long does it take to build a website chatbot?".
2. Clarification:
   - If a user's question or requirement is ambiguous or unclear, ask exactly ONE short clarifying question instead of guessing.
3. Sales & Scoping:
   - Explain our relevant services and what we can do for the client.
   - Ask smart, focused questions (1-3 questions) to understand the client's needs, then recommend the best service.
   - Guide the client to action: provide the exact relevant page link ([View Services](/services), [See Pricing](/pricing), or [Book a Free Call](/contact) / [Contact & Order](/contact)).
4. Handling Objections:
   - Price: Mention our **$499 Starter** tier, explain that automation pays for itself by saving 15-20+ hours of manual labor per week, and note we offer fixed pricing (50% upfront, 50% on delivery) with zero hidden fees.
   - Time / Timeline: Outline our quick 5-10 day to 2-3 week sprints and clear milestone-based deliveries.
   - Trust / Proof: Cite our real case studies (Raasid, Pharma-Ease), highlight that clients retain 100% ownership of code/accounts, and offer our free 30-minute discovery consultation on the [Contact Page](/contact).
5. Honesty & Boundaries:
   - If you do not know an answer or if something is outside our documented capabilities, say: "I'm not sure about that specific detail, let me connect you with our team on our [Contact Page](/contact)!" Never invent prices, features, or links.
6. Anti-Looping:
   - Never repeat the exact same canned response or repeat the same list of questions back-to-back. Progress the conversation forward based on what the user just said.

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

  knowledge += "\n\nOUR TEAM:\n- Rasheed — Networking Expert: designs and secures the network and server infrastructure behind client deployments.\n- Muhammad Ilyas — Full-Stack Web App Software Developer: builds production web apps with Next.js 14, React, MERN, and TypeScript.\n- Hassan — Automation Expert & Engineer: builds n8n pipelines, AI agents, and API integrations.\n- Mudassir — Graphic Designer: creates brand identities, UI graphics, and visual assets.";

  knowledge += "\n\nBLOG & INSIGHTS:\n";
  if (blog?.length) {
    blog.slice(0, 5).forEach((b: any) => {
      knowledge += `- ${b.title}: ${b.excerpt || ""}\n`;
    });
  }

  knowledge += "\n\nCONTACT & CONSULTATION:\nEmail: automations@cognitobyte.com\nFree Strategy Session: Available via /contact";

  knowledge += `

FREQUENTLY ASKED QUESTIONS (use these to answer in detail with reasoning; adapt to the user's context):
Q: What exactly does CognitoByte do?
A: Four things: (1) AI automation with n8n that connects the tools a business already uses, (2) custom chatbots on WhatsApp Cloud API and websites, (3) autonomous AI agents that decide and execute multi-step tasks, and (4) full-stack web apps in Next.js 14 / MERN. They combine well — e.g. a store plus a WhatsApp bot that syncs orders to Google Sheets.

Q: How much does WhatsApp automation cost?
A: Most WhatsApp bots land between **$499** and **$1,299** depending on scope. Price is driven by the number of conversation flows, integrations (Shopify, CRM, Google Sheets), languages, and whether AI/NLP is required. A simple FAQ/order-status bot sits at the lower end; a multi-flow bot with cart recovery, COD confirmation, and CRM sync is quoted custom. The exact quote comes after a short scoping conversation.

Q: How long will my project take?
A: Starter single-workflow automation: **5-10 business days**. WhatsApp chatbot with 2-4 flows: **2-3 weeks**. Complex multi-flow automation with CRM/payment integrations: **4-6 weeks**. Full-stack web app: **4-8 weeks** depending on features. Timelines start once scope and account/API access are confirmed.

Q: Can you integrate with my existing tools?
A: Yes. n8n connects 400+ apps — Shopify, WooCommerce, Google Sheets/Calendar, HubSpot, Slack, Notion, Airtable, Stripe, CRMs, and any REST API. If a tool has an API, we can connect it; if it does not, we scope a practical workaround such as CSV sync or middleware.

Q: What does the process look like?
A: 1) Free 30-minute discovery call, 2) architecture and flow design, 3) build and testing, 4) deployment into your accounts, 5) handover plus post-launch support. You get regular progress updates throughout.

Q: Who owns the code and automations?
A: You do. Code is handed over on delivery, and automations are built in your own n8n/WhatsApp/Shopify accounts wherever possible, so there is no vendor lock-in.

Q: Do you provide support after launch?
A: Yes. Every project includes a post-launch support window (typically 2-4 weeks) for fixes and adjustments. Ongoing maintenance/monitoring plans are available. Because workflows run in your accounts, you are not dependent on us to keep them running.

Q: Which languages can the WhatsApp bot handle?
A: English, Urdu, Roman Urdu, Arabic, and others. We use intent/NLU-based handling so the bot understands informal Roman Urdu (e.g. "order kahan hai?") instead of relying on exact keywords.

Q: What is the difference between a chatbot and an automation?
A: A chatbot is the conversational front end (WhatsApp or website) that talks to customers. Automation is the plumbing behind it that moves data between tools (new order -> Google Sheet -> CRM -> confirmation message). AI agents combine both: they converse, decide, and execute multi-step work.

Q: Do you work with small businesses and startups?
A: Yes — the **$499 Starter** tier exists for businesses that need one high-impact workflow. Most clients start small (one bot or one automation) and expand once the ROI is visible.

Q: How do payments work?
A: Fixed-scope projects are typically **50% upfront, 50% on delivery**. Larger builds can be milestone-based. Scope and price are agreed before any work starts, and there are no hidden fees.

Q: Do you sign NDAs? How is my data handled?
A: Yes, NDA on request. Access credentials go into secure vaults, data stays in your accounts wherever possible, and we never train models on client data.

Q: Is the consultation really free?
A: Yes — a free 30-minute discovery call. We audit your workflow, tell you what is realistically worth automating (and what is not), and give a rough timeline and price range with no obligation.

Q: Can you take over or fix an existing bot, website, or n8n workflow built by someone else?
A: Yes. We audit the existing setup, document what works, then refactor or rebuild the weak parts. Takeover work is common when a previous developer disappears or workflows keep failing.

Q: What results have you achieved?
A: Raasid (WhatsApp bot for a food brand) recovers ~**30%** of abandoned carts and cut fake COD orders by ~**60%**; Pharma-Ease runs AI medicine recommendations with Stripe checkout; IlyasKaGpt runs fully offline in the browser. Ask about the case study closest to your use case.

Q: How do I get started?
A: Tell us what you want to build or automate and answer a few scoping questions here, or book the free call at /contact. Either way you get a concrete recommendation with timeline and price range.`;

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
/* ─────────────────────────────────────────────
   Fallback Intelligent Responder
   (Guarantees accurate answers on all projects & web dev
   with multi-turn follow-up resolution and anti-looping)
───────────────────────────────────────────── */
interface ChatHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function buildRollingSummary(olderMessages: ChatHistoryMessage[]): string {
  if (!olderMessages.length) return "";
  const keyTurns = olderMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content.slice(0, 100).replace(/\n+/g, " ")}`);
  return `PREVIOUS CONVERSATION SUMMARY (EARLIER TURNS):\n${keyTurns.join("\n")}`;
}

function resolveTopicFromHistory(recentMessages: ChatHistoryMessage[]): {
  topic: "chatbot" | "whatsapp" | "n8n" | "web-dev" | "general";
  detail: string;
} {
  // Look back through recent turns to identify what the user was discussing
  const reversed = [...recentMessages].reverse();
  for (const msg of reversed) {
    const text = (msg.content || "").toLowerCase();
    if (text.includes("whatsapp") || text.includes("raasid") || text.includes("cart recovery") || text.includes("cod")) {
      return { topic: "whatsapp", detail: "WhatsApp Automation / Bot" };
    }
    if (text.includes("chatbot") || text.includes("chat bot") || /\bbot\b/.test(text)) {
      if (text.includes("website") || text.includes("web")) {
        return { topic: "chatbot", detail: "Website Chatbot" };
      }
      return { topic: "chatbot", detail: "Custom Chatbot" };
    }
    if (text.includes("n8n") || text.includes("automation") || text.includes("pipeline") || text.includes("workflow")) {
      return { topic: "n8n", detail: "Workflow Automation / n8n" };
    }
    // Match standalone "website" only when not already identified as a chatbot
    if (text.includes("web app") || text.includes("mern") || text.includes("next.js") || text.includes("store") || text.includes("ecommerce") || text.includes("e-commerce") || text.includes("frontend") || text.includes("backend") || text.includes("full stack")) {
      return { topic: "web-dev", detail: "Web Development" };
    }
  }
  return { topic: "general", detail: "CognitoByte Services" };
}

function generateFallbackResponse(
  userQuery: string,
  history: ChatHistoryMessage[],
  projects: any[],
  services: any[],
  isAdmin: boolean,
  adminData: string
): string {
  const query = userQuery.toLowerCase().trim();
  const lastAssistantMsg = [...history].reverse().find((m) => m.role === "assistant")?.content || "";
  const context = resolveTopicFromHistory(history);

  if (isAdmin && (query.includes("revenue") || query.includes("order") || query.includes("user") || query.includes("stat") || query.includes("sale") || query.includes("admin") || query.includes("telemetry") || query.includes("metric"))) {
    return adminData;
  }

  // Follow-up resolution for ambiguous pronouns or short inquiries ("how long?", "how much?", "timeline", "it", "that")
  const isTimelineQuery = query.includes("how long") || query.includes("timeline") || query.includes("turnaround") || query.includes("time frame") || query.includes("duration");
  const isCostQuery = query.includes("how much") || query.includes("cost") || query.includes("price") || query.includes("pricing") || query.includes("budget") || query.includes("rate");

  // Handle timeline follow-up
  if (isTimelineQuery) {
    if (context.topic === "chatbot") {
      return `For a **${context.detail}**, our build timeline is **2 to 3 weeks** from kickoff to deployment.\n\n• **Week 1:** Conversation flow design and knowledge base training.\n• **Week 2:** Integration with your tools and testing.\n• **Week 3:** Live deployment, testing, and team handoff.\n\nReady to get started? You can [Contact & Order](/contact) or [Book a Free Call](/contact).`;
    }
    if (context.topic === "whatsapp") {
      return `A **WhatsApp Automation System** typically takes **2 to 3 weeks**.\n\n• **5-10 business days** for starter single-flow automations.\n• **2-3 weeks** for custom multi-flow setups with cart recovery and CRM sync.\n\nLet's get your setup started: [Contact & Order](/contact).`;
    }
    if (context.topic === "web-dev") {
      return `For **Full-Stack Web Development**, timelines typically range from **4 to 8 weeks** depending on requirements:\n\n• **Landing page or MVP:** 2-3 weeks.\n• **Full-stack web application or E-commerce:** 4-6 weeks.\n• **Complex custom platform:** 6-8 weeks.\n\nYou can review our work at [View Projects](/projects) or reach out at [Contact & Order](/contact).`;
    }
    if (context.topic === "n8n") {
      return `For **n8n Workflow Automation**, a starter single workflow takes **5-10 business days**, while multi-app enterprise pipelines take **2-4 weeks**.\n\nReady to automate your workflows? [Contact & Order](/contact).`;
    }
    return `Our project timelines depend on scope:\n\n• **Starter Automations:** 5-10 business days\n• **Website & WhatsApp Chatbots:** 2-3 weeks\n• **Full-Stack Web Apps:** 4-8 weeks\n\nWhich timeline fits your project? Reach out at [Contact & Order](/contact).`;
  }

  // Handle cost/pricing follow-up
  if (isCostQuery) {
    if (context.topic === "chatbot" || context.topic === "whatsapp") {
      return `For a **${context.detail}**, pricing typically ranges from **$499** (Starter single flow) to **$1,299** (Growth System with multi-tool integration, cart recovery, and CRM sync).\n\nAll packages include source code ownership and post-launch support. Check our [View Pricing](/pricing) or [Contact & Order](/contact) for a quick quote.`;
    }
    if (context.topic === "web-dev") {
      return `For **Full-Stack Web Development**, projects are scoped based on features:\n\n• **Starter MVP / Landing:** Custom scoped starting from **$499** - **$999**\n• **Full MERN/Next.js Application:** Quoted based on page count and APIs\n\nWe provide 50% upfront / 50% on delivery terms. See details at [View Pricing](/pricing) or talk to us at [Contact & Order](/contact).`;
    }
    return `### 💳 Pricing Overview\n\n• **Starter Automation:** **$499** (1 core workflow or basic bot)\n• **Growth System:** **$1,299** (Multi-tool pipeline + AI chatbot + CRM sync)\n• **Enterprise & Web:** Custom scoped\n\nExplore our tiers at [View Pricing](/pricing) or let's discuss your scope at [Contact & Order](/contact).`;
  }

  // Team & Ownership queries
  if (
    query.includes("team") ||
    query.includes("who are you") ||
    query.includes("founder") ||
    query.includes("who builds") ||
    query.includes("who build") ||
    query.includes("own the code") ||
    query.includes("code ownership") ||
    query.includes("rasheed") ||
    query.includes("muhammad ilyas") ||
    query.includes("mudassir") ||
    query.includes("hassan")
  ) {
    return `### 👥 The CognitoByte Team & Ownership\n\n• **Muhammad Ilyas** — Full-Stack Web Developer (**Next.js 14**, **React**, **MERN**, **TypeScript**).\n• **Hassan** — Automation Expert & Engineer (**n8n** pipelines, AI agents, API integrations).\n• **Rasheed** — Networking & Infrastructure Expert.\n• **Mudassir** — Graphic Designer & UI visual assets.\n\n**100% Code Ownership:** You own 100% of the source code, automations, and accounts upon delivery with zero vendor lock-in. [Learn more on About](/about) or [Book a Free Call](/contact).`;
  }

  // WhatsApp automation intent
  if (query.includes("whatsapp") || query.includes("raasid") || query.includes("cart recovery") || query.includes("cod order") || query.includes("cod confirmation")) {
    // Prevent repeating questions if already asked in the last assistant message
    if (lastAssistantMsg.includes("Business type") || lastAssistantMsg.includes("Main job")) {
      return `Got it! Based on those details, we recommend our **Growth System ($1,299)** with WhatsApp Cloud API integration, automated order notifications, and CRM sync. Delivery is typically **2-3 weeks**.\n\nReady to get started? [Book a Free Call](/contact) or [Contact & Order](/contact).`;
    }
    return `### 📱 WhatsApp Automation & Chatbots\n\nWe build custom **WhatsApp Cloud API** systems for customer support, order updates, COD confirmation, and cart recovery. For example, our **Raasid** bot recovered **~30%** of abandoned carts for a food brand.\n\nTo recommend the best setup, could you share:\n1. Is this for support, lead generation, or order/cart recovery?\n2. What tools do you currently use (Shopify, WooCommerce, Google Sheets)?\n\nYou can also [Explore Services](/services) or [Contact & Order](/contact).`;
  }

  // Specific project queries
  if (query.includes("pharma") || query.includes("pharmacy")) {
    return `### 💊 Pharma-Ease\n\nA full-stack pharmacy e-commerce platform built with **Next.js 14**, **MERN**, and **Stripe**:\n• **AI Medicine Recommendations:** Powered by Groq AI.\n• **Background Jobs:** Automated inventory and order alerts via Inngest.\n\n[View Case Study](/projects/pharma-ease-pharmacy-platform) · Need a similar web platform? [Contact & Order](/contact).`;
  }

  if (query.includes("ilyas") || query.includes("offline") || query.includes("on-device") || (query.includes("gpt") && !query.includes("chat"))) {
    return `### 🧠 IlyasKaGpt\n\n100% private, on-device AI assistant:\n• **Zero Network Calls:** Runs local quantized LLMs directly in the browser via WebGPU/Wasm.\n• **Privacy First:** Instant responses with zero cloud data transmission.\n\n[View Case Study](/projects/ilyaskagpt-offline-ai-assistant) · [Contact & Order](/contact) to scope a private AI build.`;
  }

  if (query.includes("linkedin") || query.includes("social media") || query.includes("instagram") || query.includes("facebook")) {
    return `### 🚀 Social Media Automation Engine\n\nAutonomous content pipelines built with n8n & AI:\n• **LinkedIn Engine:** AI-driven thought leadership generation and scheduling.\n• **Multi-Platform:** One-click publishing to Instagram, LinkedIn, and Facebook.\n\n[View Projects](/projects) · [Contact & Order](/contact) to build your pipeline.`;
  }

  // n8n / workflow automation intent
  if (query.includes("n8n") || query.includes("automation") || query.includes("automate") || query.includes("workflow") || query.includes("zapier") || query.includes("make.com")) {
    if (lastAssistantMsg.includes("Which tools should talk")) {
      return `Understood! We can integrate those tools using custom **n8n pipelines** with error-recovery and automated retry logic. Timeline is usually **5-10 business days** for single flows, or **2-3 weeks** for multi-app systems.\n\nCheck our plans at [View Pricing](/pricing) or [Contact & Order](/contact).`;
    }
    return `### ⚙️ Workflow Automation with n8n\n\nWe connect your tools to eliminate repetitive manual work — 400+ integrations including Shopify, Google Sheets, CRMs, Slack, and Stripe.\n\n• **Starter Tier:** **$499** (1 core workflow)\n• **Growth Tier:** **$1,299** (Multi-tool pipeline + AI logic)\n\nWhich tools do you want connected? [Explore Services](/services) or [Contact & Order](/contact).`;
  }

  // Generic chatbot intent
  if (query.includes("chatbot") || query.includes("chat bot") || /\bbot\b/.test(query)) {
    // If user specified platform or answered previous question
    if (query.includes("website") || query.includes("web") || lastAssistantMsg.includes("Where should it live")) {
      return `Yes, we build custom **Website Chatbots** trained on your business knowledge! They can answer FAQs, capture leads, and sync chats to your CRM.\n\n• **Timeline:** **2-3 weeks**\n• **Pricing:** Starting at **$499**\n\nReady to get started? [View Pricing](/pricing) or [Contact & Order](/contact).`;
    }
    return `### 🤖 Custom AI Chatbots\n\nYes! We build intelligent chatbots for both websites and WhatsApp to handle 24/7 customer support, capture leads, and route inquiries.\n\nDo you need the chatbot for your website, WhatsApp, or both? [Explore Services](/services) · [Contact & Order](/contact)`;
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
    return `### 💻 Full-Stack Web Development\n\nWe build responsive, fast web applications using **Next.js 14**, **React**, **MERN Stack**, and **TypeScript**.\n\n• **Featured Case Studies:** [Pharma-Ease](/projects/pharma-ease-pharmacy-platform) and [IlyasKaGpt](/projects/ilyaskagpt-offline-ai-assistant)\n• **Timeline:** **4-8 weeks** depending on complexity\n\nWhat kind of web application are you planning? [View Projects](/projects) or [Contact & Order](/contact).`;
  }

  // All projects query
  if (query.includes("project") || query.includes("portfolio") || query.includes("work") || query.includes("case stud")) {
    return `### 🏆 CognitoByte Portfolio\n\n• **Web Development:** Next.js 14, MERN Stack (Pharma-Ease, IlyasKaGpt, Al-Shifa)\n• **n8n Automation:** Automated social content engines and CRM sync\n• **Chatbots:** WhatsApp & Web customer assistants (e.g. Raasid bot)\n\n[Explore All Projects](/projects) · [Book a Free Call](/contact) to discuss your project.`;
  }

  // Services query
  if (query.includes("service") || query.includes("what do you do") || query.includes("what can you build") || query.includes("offer")) {
    return `### ⚡ CognitoByte Core Services\n\n• **Full-Stack Web Apps:** Next.js 14, MERN, React, TypeScript.\n• **Custom AI Chatbots:** Website & WhatsApp assistants with CRM sync.\n• **n8n Workflow Automation:** Connect 400+ apps to remove manual bottlenecks.\n• **Autonomous AI Agents:** Multi-step decision and execution agents.\n\nWhich service can we help you with? [Explore Services](/services) or [Contact & Order](/contact).`;
  }

  // Clarification fallback for ambiguous inputs
  if (query.length < 4 || query === "yes" || query === "no" || query === "ok" || query === "sure") {
    return `Could you tell me a little more about what you'd like to build or automate so I can guide you to the right solution? Or feel free to [Book a Free Call](/contact) with our team.`;
  }

  // Default consultative response
  return `### Hi! Welcome to CognitoByte 👋\n\nWe build **full-stack web apps** (Next.js, MERN) and **AI automations** (n8n, WhatsApp bots, website chatbots).\n\nAre you looking to build a new web application, automate a business workflow, or deploy an AI chatbot? [Explore Services](/services) · [Contact & Order](/contact)`;
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

    // Extract last 15 messages for LLM context, and create rolling summary for older messages
    const recentMessages: ChatHistoryMessage[] = messages.slice(-15).map((m: any) => ({
      role: (m.role === "assistant" || m.role === "user" ? m.role : "user") as "user" | "assistant",
      content: String(m.content || ""),
    }));
    const olderMessages: ChatHistoryMessage[] = messages.slice(0, -15).map((m: any) => ({
      role: (m.role === "assistant" || m.role === "user" ? m.role : "user") as "user" | "assistant",
      content: String(m.content || ""),
    }));

    if (olderMessages.length > 0) {
      const summaryText = buildRollingSummary(olderMessages);
      systemPrompt += `\n\n${summaryText}`;
    }

    let message: string;
    try {
      const groq = getGroq();
      // Try primary Groq model: llama-3.3-70b-versatile
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages,
        ],
        max_tokens: isAdmin ? 450 : 800,
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
            ...recentMessages,
          ],
          max_tokens: isAdmin ? 450 : 800,
          temperature: 0.3,
        });
        message = response2.choices[0]?.message?.content || "";
        if (!message.trim()) throw new Error("Empty response from secondary model");
      } catch {
        // Highly intelligent knowledge-driven fallback ensuring 100% uptime for Web Dev & Project queries
        message = generateFallbackResponse(lastUserMessage, messages, projects, services, isAdmin, adminData);
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

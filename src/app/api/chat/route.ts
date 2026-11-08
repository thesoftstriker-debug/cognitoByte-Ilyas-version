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

5. Our Team:
   - Rasheed — Networking Expert (infrastructure, secure networking, deployment connectivity).
   - Muhammad Ilyas — Full-Stack Web App Software Developer (Next.js 14, React, MERN, TypeScript).
   - Hassan — Automation Expert & Engineer (n8n pipelines, AI agents, API integrations).
   - Mudassir — Graphic Designer (brand identity, UI graphics, visual assets).

RULES FOR ANSWERING:
- BE A CONSULTANT, NOT A LINK DISPENSER. Never reply to a project inquiry with only a link or "book a call" — links never replace a real, informative answer.
- WHEN THE USER STATES A NEED (e.g. "I need WhatsApp automation", "I want an online store", "can you build a chatbot"):
  1. Acknowledge it in one short sentence and show relevant proof (a similar project/result) when useful.
  2. Ask 2-4 focused qualifying questions in a numbered list to scope the work (see guides below).
  3. Do NOT include a booking link in this first response.
- WHEN THE USER ANSWERS YOUR QUESTIONS: summarize their requirements in one line, then give a tailored recommendation — suggested solution, why it fits (reasoning), approximate timeline, and price range/package from the knowledge base — and state the next step.
- SHARE the [Book a Free Call](/contact) link ONLY when the user asks about calls/contact/pricing, has answered your scoping questions, or shows clear buying intent. Never end every reply with it.
- IF THE USER ASKS A DIRECT QUESTION (pricing, timeline, tech stack, process, support, project details), answer it fully with specifics and brief reasoning first, then optionally ONE relevant follow-up question.
- USE THE FAQ KNOWLEDGE BASE below for common questions. Give specific, detailed answers with reasoning — not one-line deflections.
- Keep replies scannable: short paragraphs and bullets. Default to 3-5 bullets, up to 7 when the question genuinely needs detail. No fluff, no essays.
- If asked about Web Development, MERN stack, Next.js, or web projects, explain CognitoByte's full-stack capabilities and highlight relevant portfolio projects.
- CRITICAL FORMATTING RULE: NEVER generate raw markdown tables (| col | col |). Use compact, structured bullet points.
- You may include useful links: [View Projects](/projects), [Explore Services](/services), [See Pricing](/pricing) — only when relevant.
- Format prices and technologies clearly in bold (e.g., **$499**, **Next.js 14**).
- If asked something unrelated to CognitoByte, politely redirect in one short sentence.

QUALIFYING QUESTIONS BY SERVICE (pick 2-4, never ask more than 4 at once):
- WhatsApp / Chatbots: Which platform (WhatsApp Business API, website, Instagram)? What should it do (support, orders, COD confirmation, abandoned-cart recovery, lead qualification)? Current tools (Shopify/WooCommerce, Google Sheets, CRM)? Languages (English/Urdu/Roman Urdu) and rough daily message volume?
- n8n / Workflow Automation: Which apps/tools need connecting? What manual process should disappear? How often does it run and at what volume? Any existing subscriptions or API access?
- AI Agents: What business task should the agent handle? What data/tools does it need access to? How much human approval/review is required?
- Web Development: What type of product (landing page, e-commerce, SaaS, dashboard, platform)? Key features/pages? Existing design or branding? Admin panel/CMS needed? Timeline and budget range?

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

  // Team queries
  if (query.includes("team") || query.includes("who are you") || query.includes("founder") || query.includes("rasheed") || query.includes("muhammad ilyas") || query.includes("mudassir") || query.includes("hassan")) {
    return `### 👥 Meet the CognitoByte Team\n\n• **Rasheed** — Networking Expert: infrastructure, secure networking, and deployment connectivity.\n• **Muhammad Ilyas** — Full-Stack Web App Developer: **Next.js 14**, **React**, **MERN**, **TypeScript**.\n• **Hassan** — Automation Expert & Engineer: **n8n** pipelines, AI agents, and API integrations.\n• **Mudassir** — Graphic Designer: brand identity, UI graphics, and visual assets.\n\nA small senior team that delivers projects end to end. [Learn more about us](/about)`;
  }

  // WhatsApp automation intent — qualify before pitching
  if (query.includes("whatsapp") || query.includes("raasid") || query.includes("cart recovery") || query.includes("cod order") || query.includes("cod confirmation")) {
    return `### 📱 WhatsApp Automation — let's scope it\n\nWe build **WhatsApp Cloud API** assistants for support, order updates, COD confirmation, and abandoned-cart recovery. Our **Raasid** bot for a food brand recovered **~30%** of abandoned carts and cut fake COD orders by **~60%**.\n\nTo recommend the right setup, tell me:\n1. **Business type** — e-commerce, restaurant, clinic, or service business?\n2. **Main job** — support, order/cart recovery, COD confirmation, or lead qualification?\n3. **Current tools** — Shopify/WooCommerce, Google Sheets, CRM, or something else?\n4. **Language & volume** — English/Urdu/Roman Urdu, and roughly how many chats per day?\n\nOnce I know these, I'll suggest the exact flows, timeline, and price range.`;
  }

  // Specific project queries
  if (query.includes("pharma") || query.includes("pharmacy")) {
    return `### 💊 Pharma-Ease\n\nFull-stack pharmacy platform built with **Next.js 14**, **MERN**, and **Stripe**:\n• **AI Medicine Recommendations:** Groq AI-powered suggestions.\n• **Background Jobs:** Automated inventory alerts via Inngest.\n\n[View Case Study](/projects/pharma-ease-pharmacy-platform) · Want something similar? Tell me about your business and I'll scope it.`;
  }

  if (query.includes("ilyas") || query.includes("offline") || query.includes("on-device") || query.includes("gpt")) {
    return `### 🧠 IlyasKaGpt\n\n100% private, on-device AI assistant:\n• **Zero Network Calls:** Runs local quantized LLMs directly in-browser via WebGPU/Wasm.\n• **Privacy First:** Instant neural responses with zero cloud data transmission.\n\n[View Case Study](/projects/ilyaskagpt-offline-ai-assistant) · Want something similar? Tell me about your use case and I'll scope it.`;
  }

  if (query.includes("linkedin") || query.includes("social media") || query.includes("instagram") || query.includes("facebook")) {
    return `### 🚀 Social Media Automation\n\nAutonomous content pipelines via n8n & AI:\n• **LinkedIn Engine:** Platform-optimized thought leadership posts.\n• **Multi-Platform:** One-click publishing to Instagram, LinkedIn, and Facebook.\n\n[View Automation Projects](/projects) · Tell me your content volume and platforms and I'll suggest a pipeline.`;
  }

  // n8n / workflow automation intent — qualify before pitching
  if (query.includes("n8n") || query.includes("automation") || query.includes("automate") || query.includes("workflow") || query.includes("zapier") || query.includes("make.com")) {
    return `### ⚙️ Workflow Automation — let's scope it\n\nWe use **n8n** to connect your tools and eliminate manual work — 400+ integrations including Shopify, Google Sheets, CRMs, Slack, Stripe, and any REST API. Typical wins: lead routing, invoice generation, order sync, reporting, and follow-up sequences.\n\nTo design the right pipeline, tell me:\n1. Which tools should talk to each other?\n2. Which manual task do you want to remove?\n3. How often does it run (daily, per order, real-time) and at what volume?\n4. **Timeline and budget range** — e.g. this month, under $1,000?\n\nI'll then map the workflow steps and give you a realistic timeline and price.`;
  }

  // Generic chatbot intent — qualify before pitching
  if (query.includes("chatbot") || query.includes("chat bot") || /\bbot\b/.test(query)) {
    return `### 🤖 Custom Chatbots — let's scope it\n\nWe build website and WhatsApp chatbots that answer customers 24/7, qualify leads, route support tickets, and sync conversations to your CRM or Google Sheets.\n\nTo recommend the right bot, tell me:\n1. **Where should it live?** Website, WhatsApp, Instagram, or all?\n2. **What should it do?** Answer FAQs, capture leads, track orders, book appointments?\n3. **What knowledge/tools does it need?** Docs, product catalog, order system, CRM?\n4. **Language and volume** — English/Urdu/Roman Urdu, and chats per day?\n\nI'll then suggest the bot architecture, timeline, and price range.`;
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
    response += `\n**To scope your build, tell me:**\n1. What are you building — landing page, e-commerce store, SaaS, dashboard, or platform?\n2. What are the must-have features and pages?\n3. What is your timeline and budget range?\n\nI'll recommend the right stack, timeline, and price. [View all projects](/projects)`;
    return response;
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
    response += `Tell me which type of project is closest to yours and I'll walk you through the approach, timeline, and price. [Explore All Projects](/projects)`;
    return response;
  }

  // Services query
  if (query.includes("service") || query.includes("what do you do") || query.includes("what can you build") || query.includes("offer")) {
    return `### ⚡ CognitoByte Core Services\n\n• **Full-Stack Web Apps:** Next.js 14, MERN, React, TypeScript.\n• **Custom AI Chatbots:** WhatsApp & Web assistants with CRM sync.\n• **n8n Automation:** Connect tools & eliminate manual work.\n• **Autonomous AI Agents:** Multi-step business task execution.\n\nWhich of these is closest to what you need? Tell me a bit about your business and the task you want handled, and I'll recommend an approach with a timeline and price range. [View All Services](/services)`;
  }

  // Pricing query
  if (query.includes("price") || query.includes("cost") || query.includes("package") || query.includes("how much") || query.includes("budget")) {
    return `### 💳 Pricing Overview\n\n• **Starter Automation:** $499 (1 core workflow)\n• **Growth System:** $1,299 (Multi-tool pipeline + AI chatbot)\n• **Enterprise & Web:** Custom scoped\n\n*Final price depends on number of flows, integrations, and languages. Share your use case and I'll point you to the right tier and give a realistic range.*\n\n[View Pricing Plans](/pricing)`;
  }

  // Contact / consultation query
  if (query.includes("contact") || query.includes("call") || query.includes("email") || query.includes("hire") || query.includes("book")) {
    return `### 📞 Get in Touch\n\n• **Free Call:** Book a 30-min discovery session on our [Contact Page](/contact).\n• **Email:** \`automations@cognitobyte.com\`\n• **Turnaround:** Guaranteed response within 24 hours.`;
  }

  // Default consultative response
  return `### Hi! Let's figure out what you need 👋\n\nWe build **full-stack web apps** (Next.js, MERN) and **AI automations** (n8n, WhatsApp bots, AI agents).\n\nTell me:\n1. What are you trying to build or automate?\n2. What type of business is it for?\n3. Roughly what timeline and budget are you working with?\n\nWith those answers I can recommend the right solution, timeline, and price range.`;
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
        max_tokens: isAdmin ? 350 : 700,
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
          max_tokens: isAdmin ? 350 : 700,
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

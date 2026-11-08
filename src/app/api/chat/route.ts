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
- Answer questions directly, accurately, and enthusiastically using the knowledge base provided below.
- If asked about Web Development, MERN stack, Next.js, or web projects, explain CognitoByte's full-stack development capabilities and highlight relevant portfolio projects.
- Use clean formatting with concise bullet points and bold headers.
- Include links when helpful: [View Projects](/projects), [Explore Services](/services), [See Pricing](/pricing), [Book a Free Call](/contact).
- If asked something completely unrelated to CognitoByte's business, software, development, or automation, politely redirect back to CognitoByte.

KNOWLEDGE BASE:
{knowledge}`;

/* ─────────────────────────────────────────────
   ADMIN SYSTEM PROMPT  (full data access)
───────────────────────────────────────────── */
const ADMIN_SYSTEM_PROMPT = `You are an intelligent admin assistant for CognitoByte. You have FULL access to live website data, orders, revenue, products, users, web development projects, automations, and coupons.

Keep answers SHORT, data-focused, and direct. Use bullet points and numbers. Format currency as USD.

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

    let data = `📊 BUSINESS OVERVIEW (Live Data as of ${now.toLocaleDateString()})\n\n`;
    data += `REVENUE:\n- Total all-time: $${totalRevenue.toFixed(2)}\n- This month: $${monthlyRevenue.toFixed(2)} (${monthlyOrders.length} orders)\n\n`;
    data += `ORDERS:\n- Total orders: ${orders.length}\n- Pending: ${pending} | Processing: ${processing} | Completed: ${completed} | Cancelled: ${cancelled}\n\n`;

    data += `TOP SELLING PRODUCTS:\n`;
    if (topProducts.length) {
      topProducts.forEach((p, i) => {
        data += `${i + 1}. ${p.name} — ${p.qty} sold — $${p.revenue.toFixed(2)} revenue\n`;
      });
    } else {
      data += "- No product sales yet\n";
    }

    data += `\nRECENT ORDERS:\n`;
    recentOrders.forEach((o) => {
      data += `- #${o.id} | ${o.buyer} | $${(o.total || 0).toFixed(2)} | ${o.status} | ${o.date}\n`;
    });

    data += `\nCONTENT COUNTS:\n`;
    data += `- Products: ${products.length} (${products.filter((p: any) => p.isActive).length} active)\n`;
    data += `- Services: ${services.length}\n`;
    data += `- Projects: ${projects.length} (${projects.filter((p: any) => p.category === "web-dev").length} Web Dev, ${projects.filter((p: any) => p.category === "n8n").length} n8n, ${projects.filter((p: any) => p.category === "chatbot").length} Chatbots)\n`;
    data += `- Blog posts: ${blogs.length}\n`;
    data += `- Pricing plans: ${pricing.length}\n`;
    data += `- Users registered: ${users.length}\n`;
    data += `- Coupons: ${coupons.length} (${coupons.filter((c: any) => c.isActive).length} active)\n`;

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

  if (isAdmin && (query.includes("revenue") || query.includes("order") || query.includes("user") || query.includes("stat") || query.includes("sale"))) {
    return `### 📊 Live Admin Telemetry\n\n${adminData}`;
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
    let response = `### 💻 Full-Stack Web Development at CognitoByte\n\n`;
    response += `CognitoByte designs and engineers modern, high-performance web applications using **Next.js 14 (App Router)**, **React**, the **MERN Stack** (MongoDB, Express, React, Node.js), **TypeScript**, and **Tailwind CSS**.\n\n`;
    response += `#### Featured Web Development Projects:\n`;
    if (webProjects.length) {
      webProjects.forEach((p) => {
        response += `* **[${p.title}](/projects/${p.slug})**: ${p.shortDescription || p.description || ""}\n  * *Tech Stack:* ${p.tags?.join(", ") || "Next.js, TypeScript, Tailwind"}\n`;
      });
    } else {
      response += `* **Pharma-Ease**: AI-powered pharmacy platform with Groq AI recommendations, Stripe payments, and Inngest background jobs.\n`;
      response += `* **IlyasKaGpt**: 100% offline, on-device AI assistant running quantized LLMs & VLMs directly in the browser with WebGPU/Wasm.\n`;
      response += `* **Full-Stack MERN E-Commerce Platform**: Complete production storefront with JWT auth, Stripe checkout, and Redux Toolkit.\n`;
      response += `* **Al-Shifa Hospital Platform**: Healthcare platform with MySQL (Aiven Cloud), Bcrypt authentication, and Cloudinary image hosting.\n`;
      response += `* **Web Testing Tool**: Automated BDD QA framework with Puppeteer and Cucumber.js/Gherkin.\n`;
    }
    response += `\nNeed a custom web platform or application? [Book a free discovery call](/contact) or [view all our projects](/projects)!`;
    return response;
  }

  // Specific project queries
  if (query.includes("pharma") || query.includes("pharmacy")) {
    return `### 💊 Pharma-Ease – AI-Powered Pharmacy Platform\n\n**Pharma-Ease** is a full-stack MERN + Next.js e-commerce platform built by CognitoByte:\n* **AI Medicine Recommendations**: Integrated with Groq AI to suggest verified alternatives and health insights.\n* **Reliable Background Workflows**: Inngest-powered queues for stock updates and customer notifications.\n* **Secure Checkout**: Stripe payment integration with real-time receipt generation.\n* **Architecture**: Next.js 14, Node.js, Express, MongoDB Atlas, Cloudinary, and Tailwind CSS.\n\n[Explore the Pharma-Ease Case Study](/projects/pharma-ease-pharmacy-platform)`;
  }

  if (query.includes("ilyas") || query.includes("offline") || query.includes("on-device") || query.includes("gpt")) {
    return `### 🧠 IlyasKaGpt – 100% Offline On-Device AI Assistant\n\n**IlyasKaGpt** is a privacy-first, serverless AI assistant built by CognitoByte:\n* **100% Private & Offline**: Zero network calls; all neural reasoning occurs locally on the client's device.\n* **WebGPU & WASM Acceleration**: Executes 4-bit GGUF quantized LLMs & VLMs directly in the browser.\n* **Multi-Modal Capabilities**: Document analysis, text generation, and private data exploration.\n\n[Explore the IlyasKaGpt Case Study](/projects/ilyaskagpt-offline-ai-assistant)`;
  }

  if (query.includes("raasid") || query.includes("whatsapp") || query.includes("cod") || query.includes("cart recovery")) {
    return `### 📱 Raasid WhatsApp Automation System\n\n**Raasid WhatsApp Automation** is an intelligent assistant built for a food brand by CognitoByte:\n* **24/7 Customer Support**: Answers product & delivery questions in natural Roman Urdu and English.\n* **Abandoned Cart Recovery**: Automatically pings abandoned Shopify carts after 1 hour, recovering **~30% of lost revenue**.\n* **Cash-on-Delivery (COD) Confirmation**: Interactive WhatsApp buttons cut fake orders and returns by **60%**.\n* **Weekly Telemetry**: Direct analytics sync with Google Sheets.\n\n[Explore the Raasid Case Study](/projects/raasid-whatsapp-automation)`;
  }

  if (query.includes("linkedin") || query.includes("social media") || query.includes("instagram") || query.includes("facebook")) {
    return `### 🚀 Social Media & Content Automation Engines\n\nCognitoByte builds autonomous content generation pipelines:\n* **LinkedIn Automation Engine**: Generates platform-optimized text posts in your brand voice, formats them for peak engagement, and auto-queues for peak hours.\n* **Multi-Platform Social Media System**: Takes raw ideas and outputs tailored Instagram carousels, LinkedIn thought leadership, and Facebook community prompts in one click.\n* **Single-Click Social Designer**: Automated trending topic scraper that drafts copy and generates graphics via n8n.\n\n[View Social Automation Projects](/projects)`;
  }

  // All projects query
  if (query.includes("project") || query.includes("portfolio") || query.includes("work") || query.includes("case stud")) {
    let response = `### 🏆 CognitoByte Portfolio & Case Studies\n\n`;
    response += `We build end-to-end solutions across **Full-Stack Web Development**, **n8n Automation**, and **AI Chatbots**:\n\n`;
    response += `#### 💻 Web Development:\n`;
    response += `* **Pharma-Ease**: AI-powered pharmacy platform with Groq AI recommendations & Stripe.\n`;
    response += `* **IlyasKaGpt**: 100% offline on-device AI assistant running local LLMs via WebGPU.\n`;
    response += `* **Full-Stack MERN E-Commerce**: Production multi-product store with JWT & Stripe.\n`;
    response += `* **Al-Shifa Hospital Platform**: Healthcare platform with Next.js & Cloud MySQL.\n`;
    response += `* **Web Testing Tool**: Automated BDD browser testing framework with Puppeteer & Cucumber.js.\n\n`;
    response += `#### ⚡ AI & n8n Automation:\n`;
    response += `* **Raasid WhatsApp Automation**: 24/7 bot recovering ~30% of abandoned carts with Roman Urdu NLP.\n`;
    response += `* **LinkedIn Automation Engine**: 10x faster AI content generation & automated scheduling.\n`;
    response += `* **Multi-Platform Social System**: Content engine publishing across Instagram, LinkedIn, and Facebook.\n\n`;
    response += `[Click here to view all projects with live demos and metrics](/projects)!`;
    return response;
  }

  // Services query
  if (query.includes("service") || query.includes("what do you do") || query.includes("what can you build") || query.includes("offer")) {
    return `### ⚡ CognitoByte Core Services\n\n1. **Full-Stack Web Development**: High-performance web apps built with Next.js 14, MERN Stack, TypeScript, Tailwind CSS, real-time WebSockets, and secure cloud databases.\n2. **AI Agents & Autonomous Swarms**: Multi-step reasoning agents that qualify leads, process documents, and orchestrate actions across tools.\n3. **Custom AI Chatbots**: 24/7 website and WhatsApp assistants with live CRM integration and cart recovery.\n4. **n8n Workflow Automation**: Connecting your existing SaaS tools (CRM, invoicing, emails, Google Sheets) to eliminate 20+ hours of manual work weekly.\n5. **Workflow & Systems Design**: Auditing operational bottlenecks and architecting scalable digital pipelines.\n\n[Explore our full services catalog](/services) or [book a free strategy call](/contact)!`;
  }

  // Pricing query
  if (query.includes("price") || query.includes("cost") || query.includes("package") || query.includes("how much")) {
    return `### 💳 CognitoByte Pricing Overview\n\n* **Starter Automation ($499)**: 1 core workflow pipeline, basic tool integration, error-handling & handoff.\n* **Growth System ($1,299)**: Up to 3 connected automations, AI chatbot integration, CRM sync, and 30-day monitoring.\n* **Enterprise & Custom Web Builds**: Tailored full-stack Next.js/MERN applications, custom agent swarms, and SLA support.\n\nEvery project starts with a **free 30-minute discovery call** where we audit your requirements and provide an exact quote.\n\n[View Detailed Pricing Plans](/pricing) or [Book a Call](/contact)`;
  }

  // Contact / consultation query
  if (query.includes("contact") || query.includes("call") || query.includes("email") || query.includes("hire") || query.includes("book")) {
    return `### 📞 Let's Connect!\n\n* **Free Strategy Session**: Book a 30-minute discovery call on our [Contact Page](/contact).\n* **Direct Email**: \`automations@cognitobyte.com\`\n* **Headquarters**: Islamabad, Pakistan (Serving clients globally & remotely)\n* **Turnaround**: We respond to all inquiries within 24 hours guaranteed!`;
  }

  // Default friendly response
  return `### Hello! Welcome to CognitoByte 👋\n\nWe build **Full-Stack Web Applications** (Next.js, MERN stack, TypeScript) and **AI Automations** (n8n pipelines, WhatsApp & web chatbots, autonomous AI agents) that save businesses time and scale operations.\n\nHere are a few things you can ask me:\n* *"Tell me about your web development projects"* (e.g. Pharma-Ease, IlyasKaGpt, Al-Shifa)\n* *"What automations can you build with n8n and WhatsApp?"*\n* *"How does your pricing work?"*\n* *"How do we get started with a project?"*\n\nHow can I help you today? You can also [explore our projects](/projects) or [book a free call](/contact)!`;
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
        max_tokens: isAdmin ? 800 : 700,
        temperature: 0.5,
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
          max_tokens: isAdmin ? 800 : 700,
          temperature: 0.5,
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

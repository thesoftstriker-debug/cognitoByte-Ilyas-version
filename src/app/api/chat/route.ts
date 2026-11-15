import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { formatStreamPart } from "ai";
import { getBlogPosts, getPricingFromDb, getProjectsFromDb, getServicesFromDb } from "@/lib/data";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

/* ─────────────────────────────────────────────
   SALESGPT CONSULTATIVE SYSTEM PROMPT
───────────────────────────────────────────── */
const SALESGPT_SYSTEM_PROMPT = `You are the lead AI Sales & Technical Consultant for CognitoByte (https://cognitobyte.com).
Your mission: Turn curious website visitors into qualified leads and paying clients by acting as a brilliant, consultative technical partner.

OUR IDENTITY & STACK:
- Specialization: Full-Stack Web Development, Custom AI Chatbots (Web & WhatsApp), n8n Workflow Automation, and Autonomous AI Agents.
- Core Stack: Next.js 14, React, MERN (MongoDB, Express, React, Node.js), TypeScript, Tailwind CSS, n8n, WhatsApp Cloud API, Groq AI, LangChain.
- Core Team:
  • Muhammad Ilyas — Full-Stack Web Developer (Next.js 14, React, MERN, TypeScript).
  • Hassan — Automation Expert & Engineer (n8n pipelines, AI agents, API integrations).
  • Rasheed — Networking & Infrastructure Expert.
  • Mudassir — Graphic Designer & UI visual assets.

CASE STUDIES & PROOF:
• Raasid WhatsApp Bot: Built for a food brand; recovered ~30% abandoned carts and cut fake COD orders by ~60%.
• Pharma-Ease: Full-stack pharmacy e-commerce platform built with Next.js 14, MERN, and Stripe with Groq AI recommendations.
• IlyasKaGpt: 100% private on-device AI running in-browser via WebGPU/Wasm with zero network latency or cloud data leakage.

PRICING & TIMELINES:
• Starter Automation: **$499** (1 core workflow or basic bot, 5-10 business days).
• Growth System: **$1,299** (Multi-tool automation + AI chatbot + CRM sync + 30-day support, 2-3 weeks).
• Full-Stack Web Apps: Custom scoped (4-8 weeks, starting from $499-$999 for MVPs).
• Payment terms: Fixed price, 50% upfront, 50% upon successful delivery. 100% client code & account ownership.

EXACT ALLOWED LINKS (Never invent other URLs):
• [Explore Services](/services)
• [View Pricing](/pricing)
• [View Projects](/projects)
• [Book a Free Call](/contact)
• [Contact & Order](/contact)
• [About Us](/about)

SALESGPT CONVERSATIONAL RULES:
1. CONSULTATIVE PROBLEM SOLVING (HANDLE OUT-OF-THE-BOX / OUGHT QUESTIONS):
   - Never say "We don't do that" or "We only do X".
   - If a client asks for something unusual (e.g. competitor scraping, restaurant kitchen thermal printing, IoT farm sensors, sentiment escalation, PDF invoice OCR, automated trading alerts):
     Break down the business problem, map it to technical architecture (Next.js, n8n webhooks, APIs, AI models), explain how CognitoByte can build it reliably, and provide a clear timeline/cost estimate.
2. NATURAL & MULTILINGUAL:
   - Match the user's language and tone! If they ask in Roman Urdu ("bhai", "kya banate ho", "kitne ka hoga"), reply in natural, professional, respectful Roman Urdu. If in English, reply in crisp English.
3. OBJECTION HANDLING:
   - Price objection: Explain the ROI. A $499 automation saves 15-20 hours of manual labor every week, paying for itself in the first month.
   - Trust objection: Point to real case studies (Raasid, Pharma-Ease), 100% code ownership in client accounts, and offer a free 30-minute discovery call at [Book a Free Call](/contact).
   - Hallucination / AI risk: Explain RAG guardrails, deterministic fallback logic, and human handoff mechanisms.
4. HIGH-CONVERTING CLOSING (CALL TO ACTION):
   - Always conclude with a natural, low-friction next step: e.g. inviting them to [Book a Free Call](/contact), check [View Pricing](/pricing), or leave their contact details.`;

/* ─────────────────────────────────────────────
   Knowledge Context Builder
───────────────────────────────────────────── */
async function buildKnowledge(): Promise<string> {
  const [services, projects, pricing, blog] = await Promise.all([
    getServicesFromDb(),
    getProjectsFromDb(),
    getPricingFromDb(),
    getBlogPosts("new"),
  ]);

  let knowledge = "LIVE CATALOG SERVICES:\n";
  if (services?.length) {
    knowledge += services.map((s: any) => `- ${s.title}: ${s.shortDescription || s.description || ""}`).join("\n");
  } else {
    knowledge += "- Full-Stack Web Apps: Next.js 14, MERN Stack, React, TypeScript.\n- Custom AI Chatbots: WhatsApp & Web assistants.\n- Workflow Automation: n8n pipelines connecting 400+ apps.\n";
  }

  knowledge += "\n\nFEATURED PORTFOLIO PROJECTS:\n";
  if (projects?.length) {
    projects.forEach((p: any) => {
      const tags = p.tags?.length ? ` [${p.tags.join(", ")}]` : "";
      knowledge += `* ${p.title}${tags}: ${p.shortDescription || p.description || ""}\n`;
    });
  } else {
    knowledge += "* Pharma-Ease: Pharmacy e-commerce with Next.js 14, Stripe, Groq AI\n* Raasid WhatsApp Bot: E-commerce cart recovery bot (recovered 30% carts)\n* IlyasKaGpt: On-device offline AI assistant\n";
  }

  knowledge += "\n\nPRICING PACKAGES:\n";
  if (pricing?.length) {
    knowledge += pricing.map((p: any) => `- ${p.name}: ${p.price || "Custom"} — ${p.description || ""}`).join("\n");
  } else {
    knowledge += "- Starter Automation: $499 (5-10 business days)\n- Growth System: $1,299 (2-3 weeks)\n- Enterprise: Custom scoping (4-8 weeks)\n";
  }

  return knowledge;
}

/* ─────────────────────────────────────────────
   Admin Telemetry Builder
───────────────────────────────────────────── */
async function buildAdminData(): Promise<string> {
  try {
    const db = await getMongoDb();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [orders, products, users, services, projects] = await Promise.all([
      db.collection("orders").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("products").find({}).toArray(),
      db.collection("users").find({}, { projection: { password: 0 } }).toArray(),
      db.collection("services").find({}).toArray(),
      db.collection("projects").find({}).toArray(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const monthlyOrders = orders.filter((o) => new Date(o.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return `### 📊 Live Admin Telemetry\n\n• **Total Revenue:** $${totalRevenue.toFixed(2)}\n• **This Month Revenue:** $${monthlyRevenue.toFixed(2)} (${monthlyOrders.length} orders)\n• **Total Orders:** ${orders.length}\n• **Total Users:** ${users.length}\n• **Active Projects:** ${projects.length}\n• **Services:** ${services.length}`;
  } catch (err) {
    return "Admin telemetry data temporarily unavailable.";
  }
}

/* ─────────────────────────────────────────────
   Multi-Turn Context & Rolling Summary
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
  return `PREVIOUS CONVERSATION SUMMARY:\n${keyTurns.join("\n")}`;
}

function resolveTopicFromHistory(recentMessages: ChatHistoryMessage[]): {
  topic: "chatbot" | "whatsapp" | "n8n" | "web-dev" | "pharma" | "ilyas" | "general";
  detail: string;
} {
  const reversed = [...recentMessages].reverse();
  for (const msg of reversed) {
    const text = (msg.content || "").toLowerCase();
    if (text.includes("pharma") || text.includes("pharmacy")) {
      return { topic: "pharma", detail: "Pharma-Ease Pharmacy Platform" };
    }
    if (text.includes("ilyas") || text.includes("ilyaskagpt") || text.includes("on-device") || text.includes("offline ai")) {
      return { topic: "ilyas", detail: "IlyasKaGpt Offline AI Assistant" };
    }
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
    if (
      text.includes("web app") ||
      text.includes("mern") ||
      text.includes("next.js") ||
      text.includes("store") ||
      text.includes("ecommerce") ||
      text.includes("frontend") ||
      text.includes("backend") ||
      text.includes("full stack")
    ) {
      return { topic: "web-dev", detail: "Web Development" };
    }
  }
  return { topic: "general", detail: "CognitoByte Services" };
}

/* ─────────────────────────────────────────────
   SALESGPT CONSULTATIVE FALLBACK ENGINE
   (Answers out-of-the-box questions, handles objections,
   supports English & Roman Urdu, closes leads)
───────────────────────────────────────────── */
function generateFallbackResponse(
  userQuery: string,
  history: ChatHistoryMessage[],
  projects: any[],
  services: any[],
  isAdmin: boolean,
  adminData: string
): string {
  const query = userQuery.toLowerCase().trim();
  const context = resolveTopicFromHistory(history);

  // Admin Telemetry request
  if (isAdmin && (query.includes("revenue") || query.includes("order") || query.includes("user") || query.includes("stat") || query.includes("admin") || query.includes("metric"))) {
    return adminData;
  }

  // Detect Roman Urdu input
  const isRomanUrdu =
    /\b(kya|kaise|kitna|kitne|bhai|yr|yar|mujhe|chahiye|hoga|karo|batao|paisay|paise|karna|hai|nahi|hota|karwa|lenge|bhejo|advance|hum|aap|bhi|wala|wale|sakta)\b/i.test(query);

  // 1. Specific project follow-up: "What tech stack was it built with?" or pronoun "it" for Pharma-Ease
  if (
    context.topic === "pharma" &&
    (query.includes("stack") || query.includes("tech") || query.includes("built with") || query.includes("it") || query.includes("framework"))
  ) {
    return `### 💊 Pharma-Ease Tech Stack\n\n**Pharma-Ease** was built using a high-performance modern tech stack:\n• **Frontend & SSR:** **Next.js 14**, React, TypeScript, and Tailwind CSS.\n• **Backend & Database:** **MERN Stack** (MongoDB, Express, Node.js).\n• **Payments & Security:** **Stripe** payment processing with webhook fulfillment.\n• **AI Recommendations:** **Groq AI** for real-time drug interaction and dosage suggestions.\n\n[View Pharma-Ease Project](/projects/pharma-ease-pharmacy-platform) · Need a similar high-performance platform? [Contact & Order](/contact).`;
  }

  // 2. Specific project follow-up: IlyasKaGpt
  if (
    context.topic === "ilyas" &&
    (query.includes("stack") || query.includes("tech") || query.includes("built with") || query.includes("how does it work") || query.includes("it"))
  ) {
    return `### 🧠 IlyasKaGpt Architecture\n\n**IlyasKaGpt** is built for 100% private on-device execution:\n• **Execution Engine:** WebGPU & WebAssembly (Wasm) in the browser.\n• **Model:** Quantized local LLMs running with zero cloud network calls.\n• **Author:** Architected by Muhammad Ilyas.\n\n[View IlyasKaGpt Project](/projects/ilyaskagpt-offline-ai-assistant) · [Contact & Order](/contact).`;
  }

  // 3. OUT-OF-THE-BOX: Competitor Scraping & Dynamic Pricing (check before general price query)
  if (query.includes("competitor") || query.includes("scrape") || query.includes("scraping") || query.includes("price monitor")) {
    return `### 🎯 Automated Price Intelligence & Competitor Scraping\n\nYes! We build automated price monitoring engines:\n• **Automated Crawlers:** Headless Playwright/Puppeteer crawlers that check competitor catalogs on schedule (hourly or daily).\n• **Dynamic Pricing Rules:** Calculate your optimal price (e.g. 2% lower than lowest competitor with safety profit margin).\n• **Instant Sync:** Updates your Shopify/WooCommerce catalog automatically via REST/GraphQL API and alerts you on WhatsApp/Slack.\n\nTimeline is **2-3 weeks** under our **Growth System ($1,299)**. Let's discuss your targets: [Book a Free Call](/contact) or [View Pricing](/pricing).`;
  }

  // 4. OUT-OF-THE-BOX: WordPress / WooCommerce vs Next.js 14 (check before generic price objection)
  if (query.includes("wordpress") || query.includes("woocommerce") || query.includes("shopify vs") || query.includes("why next.js") || query.includes("why nextjs")) {
    return `### ⚡ Next.js 14 vs WordPress/Shopify\n\nWhile WordPress is good for standard blogs, modern businesses choose custom **Next.js 14** web apps built by CognitoByte for 3 big reasons:\n\n1. **Blazing Speed & SEO:** Sub-second page loads give you 95+ Google PageSpeed scores, reducing ad bounce rates.\n2. **Zero Plugin Lock-in:** No bloated plugins that slow down your site or get hacked.\n3. **Native AI Integration:** Seamlessly connect AI chatbots, background workers, and custom APIs that WordPress can't handle.\n\n*Note:* If you already use Shopify, we can build custom headless Next.js storefronts on top of it! [View Projects](/projects) or [Book a Free Call](/contact).`;
  }

  // 5. OUT-OF-THE-BOX: Restaurant / Cold Room / Kitchen Thermal Printer IoT & Voice Order (check before general invoice OCR)
  if (
    query.includes("kitchen") ||
    query.includes("thermal printer") ||
    query.includes("cold room") ||
    query.includes("restaurant") ||
    query.includes("voice note") ||
    /\bvoice\b/.test(query) ||
    (isRomanUrdu && (query.includes("hotel") || query.includes("khana") || query.includes("printer") || query.includes("awaz")))
  ) {
    if (isRomanUrdu) {
      return `### 🍽️ Smart WhatsApp Ordering + Kitchen Thermal Printer\n\nJi bilkul! Ye ek zabardast custom workflow hai jo hum easily deliver kar sakte hain:\n\n1. **Voice & Text Order Bot:** Customer WhatsApp par voice note ya text bhej kar order karega (Whisper AI voice transcription ke sath).\n2. **Kitchen Printer Relay:** Jaise hi order confirm hoga, n8n webhook ke zariye aapke kitchen ke ESC/POS network thermal printer par automatic KOT print ho jayega.\n3. **CRM & Live Stock Sync:** Order database aur Google Sheets me save hoga aur inventory automatically update ho jayegi.\n\nTimeline **2-3 weeks** hai. Mazeed detail ke liye: [Book a Free Call](/contact) ya [View Pricing](/pricing).`;
    }
    return `### 🍽️ Smart WhatsApp Ordering + Kitchen Thermal Printing\n\nYes, absolutely! We build end-to-end automated ordering systems:\n\n• **Customer Order Bot:** Customers browse menus, select items, or send voice notes via WhatsApp Cloud API (transcribed via Whisper AI).\n• **Automated Kitchen Printing:** Orders instantly trigger an n8n webhook relay to your kitchen's ESC/POS network thermal printer for immediate food prep.\n• **Live Stock & CRM Sync:** Dispatches alerts and logs order records into your database/Google Sheets in real time.\n\nTimeline is **2-3 weeks** under our **Growth System ($1,299)**. Let's scope it: [Book a Free Call](/contact) or [View Pricing](/pricing).`;
  }

  // 6. OUT-OF-THE-BOX: Document AI / PDF Invoice Extraction
  if (query.includes("pdf") || query.includes("invoice") || query.includes("ocr") || query.includes("quickbooks") || query.includes("xero")) {
    return `### 📄 Document AI & Automated Invoice Processing\n\nYes! We build automated Document AI pipelines using n8n and vision/OCR models:\n• **Auto-Ingestion:** Automatically monitors inbound emails (Gmail/Outlook) or Dropbox for supplier PDF invoices.\n• **Intelligent Extraction:** Extracts vendor names, line items, quantities, taxes, and totals with 99%+ accuracy.\n• **Accounting Sync:** Posts structured data directly into QuickBooks, Xero, or Google Sheets without manual entry.\n\nTypically saves businesses 15-20+ hours of manual bookkeeping per week. Quoted under **Growth System ($1,299)** or custom scope. [Book a Free Call](/contact) or [View Pricing](/pricing).`;
  }

  // 3. Follow-up: Timeline ("how long?", "timeline", "duration", "how much time")
  const isTimelineQuery =
    query.includes("how long") ||
    query.includes("timeline") ||
    query.includes("turnaround") ||
    query.includes("time frame") ||
    query.includes("duration") ||
    (isRomanUrdu && (query.includes("kitna time") || query.includes("kitne din") || query.includes("kab tak")));

  if (isTimelineQuery) {
    if (isRomanUrdu) {
      if (context.topic === "chatbot" || context.topic === "whatsapp") {
        return `Aapke **${context.detail}** ke liye standard build timeline **2 se 3 weeks** hoti hai.\n\n• **Week 1:** Conversation flow design aur knowledge base training.\n• **Week 2:** Tool integrations (Shopify, CRM, WhatsApp API) aur testing.\n• **Week 3:** Final deployment, testing aur team handoff.\n\nKya aap chahte hain hum iska roadmap discuss karein? [Book a Free Call](/contact) ya [View Pricing](/pricing).`;
      }
      if (context.topic === "web-dev") {
        return `**Full-Stack Web Development** ke liye timeline standard **4 se 8 weeks** hoti hai:\n\n• **MVP / Starter Store:** 2-3 weeks.\n• **Custom Web Application:** 4-6 weeks.\n\nAap apna concept discuss karein: [Book a Free Call](/contact) ya [View Projects](/projects).`;
      }
      return `Hamare standard project timelines scope ke mutabiq hain:\n\n• **Starter Automations:** **5-10 business days**\n• **Website & WhatsApp Chatbots:** **2-3 weeks**\n• **Full-Stack Web Apps:** **4-8 weeks**\n\nAap kis project ke liye timeline janna chahte hain? [Contact & Order](/contact).`;
    }

    if (context.topic === "chatbot") {
      return `For a **${context.detail}**, our build timeline is **2 to 3 weeks** from kickoff to deployment.\n\n• **Week 1:** Conversation flow design and knowledge base training.\n• **Week 2:** Integration with your tools and testing.\n• **Week 3:** Live deployment, testing, and team handoff.\n\nReady to get started? You can [Contact & Order](/contact) or [Book a Free Call](/contact).`;
    }
    if (context.topic === "whatsapp") {
      return `A **WhatsApp Automation System** typically takes **2 to 3 weeks**.\n\n• **5-10 business days** for starter single-flow automations.\n• **2-3 weeks** for custom multi-flow setups with cart recovery and CRM sync.\n\nLet's get your setup started: [Contact & Order](/contact) or [Book a Free Call](/contact).`;
    }
    if (context.topic === "web-dev") {
      return `For **Full-Stack Web Development**, timelines typically range from **4 to 8 weeks** depending on requirements:\n\n• **Landing page / MVP:** 2-3 weeks.\n• **Full-stack web application or E-commerce:** 4-6 weeks.\n• **Complex custom platform:** 6-8 weeks.\n\nYou can review our work at [View Projects](/projects) or reach out at [Contact & Order](/contact).`;
    }
    if (context.topic === "n8n") {
      return `For **n8n Workflow Automation**, a starter single workflow takes **5-10 business days**, while multi-app enterprise pipelines take **2-4 weeks**.\n\nReady to automate your workflows? [Contact & Order](/contact).`;
    }
    return `Our project timelines depend on scope:\n\n• **Starter Automations:** 5-10 business days\n• **Website & WhatsApp Chatbots:** 2-3 weeks\n• **Full-Stack Web Apps:** 4-8 weeks\n\nWhich timeline fits your project? Reach out at [Contact & Order](/contact) or [Book a Free Call](/contact).`;
  }

  // 4. Follow-up: Pricing ("how much?", "cost", "price", "budget")
  const isCostQuery =
    query.includes("how much") ||
    query.includes("cost") ||
    query.includes("price") ||
    query.includes("pricing") ||
    query.includes("budget") ||
    query.includes("rate") ||
    (isRomanUrdu && (query.includes("kitne ka") || query.includes("kitna kharcha") || query.includes("charges")));

  if (isCostQuery) {
    if (isRomanUrdu) {
      if (context.topic === "chatbot" || context.topic === "whatsapp") {
        return `**${context.detail}** ki pricing **$499** (Starter single flow) se lekar **$1,299** (Growth System multi-tool integration, cart recovery aur CRM sync) ke darmiyan hoti hai.\n\nIs me 100% source code ownership aur launch ke baad support shamil hai. Mazeed details: [View Pricing](/pricing) ya [Contact & Order](/contact).`;
      }
      return `### 💳 Pricing Overview\n\n• **Starter Automation:** **$499** (1 core workflow ya basic bot, 5-10 din)\n• **Growth System:** **$1,299** (Multi-tool pipeline + AI chatbot + CRM sync)\n• **Enterprise & Web Apps:** Custom scoping\n\nHamari pricing transparent hai (50% upfront, 50% on delivery). Check karein [View Pricing](/pricing) ya [Book a Free Call](/contact).`;
    }

    if (context.topic === "chatbot" || context.topic === "whatsapp") {
      return `For a **${context.detail}**, pricing typically ranges from **$499** (Starter single flow) to **$1,299** (Growth System with multi-tool integration, cart recovery, and CRM sync).\n\nAll packages include source code ownership and post-launch support. Check our [View Pricing](/pricing) or [Contact & Order](/contact) for a quick quote.`;
    }
    if (context.topic === "web-dev") {
      return `For **Full-Stack Web Development**, projects are scoped based on features:\n\n• **Starter MVP / Landing:** Custom scoped starting from **$499** - **$999**\n• **Full MERN/Next.js Application:** Quoted based on page count and APIs\n\nWe provide 50% upfront / 50% on delivery terms. See details at [View Pricing](/pricing) or talk to us at [Contact & Order](/contact).`;
    }
    return `### 💳 Pricing Overview\n\n• **Starter Automation:** **$499** (1 core workflow or basic bot)\n• **Growth System:** **$1,299** (Multi-tool pipeline + AI chatbot + CRM sync)\n• **Enterprise & Web:** Custom scoped\n\nExplore our tiers at [View Pricing](/pricing) or let's discuss your scope at [Contact & Order](/contact).`;
  }

  // 5. Price Objection / Low Budget handling ("expensive", "lowest price", "discount", "budget issue", "cheap freelancer")
  if (
    query.includes("expensive") ||
    query.includes("lowest price") ||
    query.includes("discount") ||
    query.includes("small startup") ||
    query.includes("too much") ||
    query.includes("freelancer") ||
    query.includes("cheap") ||
    (isRomanUrdu && (query.includes("mehnga") || query.includes("kam karo") || query.includes("paisa kam") || query.includes("kam budget") || query.includes("kam paisay")))
  ) {
    if (isRomanUrdu) {
      return `Hum startups aur growing businesses ke challenges samajhte hain! Hamara **$499 Starter Package** is tarah design kiya gaya hai ke ye pehlay 30 dinon me hi 15-20 ghante ka manual work bacha kar apna ROI wapas kar deta hai. Cheap freelancers aksar adhoora kaam chhor kar gayab ho jate hain ya vulnerable code dete hain. Hum 100% clean Next.js/n8n code, milestone safety aur launch ke baad dedicated support dete hain. Aayen hum se [Book a Free Call](/contact) par baat karein ya [View Pricing](/pricing) check karein.`;
    }
    return `We completely understand budget constraints for startups! That is why our **$499 Starter tier** is designed to pay for itself within the first month by eliminating 15-20 hours of manual repetitive work every week. Unlike cheap freelance scripts that break silently and lack maintenance, we deliver production-ready, clean Next.js/n8n systems with guaranteed milestone delivery and post-launch support. For tight budgets, we can also isolate your single highest-impact bottleneck as an MVP. Let's find the right fit for your budget: [View Pricing](/pricing) or [Book a Free Call](/contact).`;
  }

  // 6. Trust / Safety / Disappearance Objection ("break my data", "disappear", "bhaag gae", "trust", "scam")
  if (
    query.includes("break my") ||
    query.includes("steal") ||
    query.includes("talk to someone") ||
    query.includes("disappear") ||
    query.includes("trust") ||
    query.includes("safe") ||
    (isRomanUrdu && (query.includes("bhaag") || query.includes("bharosa") || query.includes("dhoka") || query.includes("advance lekar")))
  ) {
    if (isRomanUrdu) {
      return `Aapka aitmaad hamari sab se pehli tarjeeh hai! CognitoByte par hamara model 100% transparent hai:\n\n1. **Milestone Payments:** 50% upfront aur baqi 50% tab jab complete solution live deliver aur test ho jaye.\n2. **100% Code Ownership:** Saara kaam aapke apne accounts (n8n, Vercel, GitHub) me deploy hota hai.\n3. **NDA & Security:** Hum client data ko kabhi train nahi karte aur safe credentials use karte hain.\n\nAap hamare founder aur developers se direct baat kar sakte hain: [Book a Free Call](/contact).`;
    }
    return `Trust and data security are our top priorities. Here is how we guarantee your safety:\n\n• **Milestone-Based Billing:** 50% upfront and 50% only after live demonstration and your full sign-off.\n• **Zero Vendor Lock-in:** Workflows and code are deployed directly into your own accounts (Vercel, n8n, GitHub); you own 100% of the code.\n• **Signed NDA & Staging Tests:** We thoroughly test automations in staging environments so your live CRM data is never corrupted.\n\nYou can speak directly with our engineering team: [Book a Free Call](/contact).`;
  }

  // 7. Team & Code Ownership queries
  if (
    query.includes("team") ||
    query.includes("who are you") ||
    query.includes("who builds") ||
    query.includes("who build") ||
    query.includes("own the code") ||
    query.includes("code ownership") ||
    query.includes("rasheed") ||
    query.includes("muhammad ilyas") ||
    query.includes("mudassir") ||
    query.includes("hassan") ||
    (isRomanUrdu && (query.includes("kaun banata hai") || query.includes("kon hai") || query.includes("code kiska hoga")))
  ) {
    return `### 👥 The CognitoByte Team & Ownership\n\n• **Muhammad Ilyas** — Full-Stack Web Developer (**Next.js 14**, **React**, **MERN**, **TypeScript**).\n• **Hassan** — Automation Expert & Engineer (**n8n** pipelines, AI agents, API integrations).\n• **Rasheed** — Networking & Infrastructure Expert.\n• **Mudassir** — Graphic Designer & UI visual assets.\n\n**100% Code Ownership:** You own 100% of the source code, automations, and accounts upon delivery with zero vendor lock-in. [Learn more on About](/about) or [Book a Free Call](/contact).`;
  }

  // 8. Specific project queries: Pharma-Ease
  if (query.includes("pharma") || query.includes("pharmacy")) {
    return `### 💊 Pharma-Ease Case Study\n\nA production pharmacy e-commerce platform built with **Next.js 14**, **MERN** (MongoDB, Express, React, Node.js), and **Stripe**:\n• **AI Drug Recommendations:** Built with Groq AI for fast medical matching.\n• **Automated Alerts:** Inngest automated background jobs for inventory notifications.\n\n[View Case Study](/projects/pharma-ease-pharmacy-platform) · Need a high-performance web platform? [Contact & Order](/contact).`;
  }

  // 9. Specific project queries: IlyasKaGpt
  if (query.includes("ilyas") || query.includes("offline") || query.includes("on-device") || (query.includes("gpt") && !query.includes("chat"))) {
    return `### 🧠 IlyasKaGpt Case Study\n\nA 100% private, on-device AI assistant:\n• **Zero Cloud Data Leakage:** Runs local quantized LLMs directly inside the client's browser via WebGPU and Wasm.\n• **Built by Muhammad Ilyas:** Sub-second latency with zero server cost per query.\n\n[View Case Study](/projects/ilyaskagpt-offline-ai-assistant) · [Contact & Order](/contact) to scope a private AI platform.`;
  }

  // 10. Specific project queries: Raasid WhatsApp bot
  if (query.includes("raasid") || query.includes("cart recovery") || query.includes("cod")) {
    return `### 📱 Raasid WhatsApp Automation Case Study\n\nBuilt for a food brand to automate customer interactions via WhatsApp Cloud API:\n• **~30% Cart Recovery:** Re-engaged abandoning users automatically.\n• **~60% Fake COD Cut:** Automated two-way WhatsApp order confirmation before dispatch.\n\n[Explore Services](/services) · [Contact & Order](/contact) to build your WhatsApp sales engine.`;
  }

  // 11. OUT-OF-THE-BOX / OUGHT 1: Competitor Scraping & Dynamic Pricing
  if (query.includes("competitor") || query.includes("scrape") || query.includes("scraping") || query.includes("price monitor")) {
    return `### 🎯 Automated Price Intelligence & Competitor Scraping\n\nYes! We build automated price monitoring engines:\n• **Automated Crawlers:** Headless Playwright/Puppeteer crawlers that check competitor catalogs on schedule (hourly or daily).\n• **Dynamic Pricing Rules:** Calculate your optimal price (e.g. 2% lower than lowest competitor with safety profit margin).\n• **Instant Sync:** Updates your Shopify/WooCommerce catalog automatically via REST/GraphQL API and alerts you on WhatsApp/Slack.\n\nTimeline is **2-3 weeks** under our **Growth System ($1,299)**. Let's discuss your targets: [Book a Free Call](/contact) or [View Pricing](/pricing).`;
  }

  // 12. OUT-OF-THE-BOX / OUGHT 2: Restaurant WhatsApp Ordering & Kitchen Printer IoT / Voice
  if (
    query.includes("kitchen") ||
    query.includes("thermal printer") ||
    query.includes("restaurant") ||
    query.includes("warehouse") ||
    query.includes("voice note") ||
    query.includes("voice") ||
    (isRomanUrdu && (query.includes("hotel") || query.includes("khana") || query.includes("printer") || query.includes("awaz")))
  ) {
    if (isRomanUrdu) {
      return `### 🍽️ Smart WhatsApp Ordering + Kitchen Thermal Printer\n\nJi bilkul! Ye ek zabardast custom workflow hai jo hum easily deliver kar sakte hain:\n\n1. **Voice & Text Order Bot:** Customer WhatsApp par voice note ya text bhej kar order karega (Whisper AI voice transcription ke sath).\n2. **Kitchen Printer Relay:** Jaise hi order confirm hoga, n8n webhook ke zariye aapke kitchen ke ESC/POS network thermal printer par automatic KOT print ho jayega.\n3. **CRM & Live Stock Sync:** Order database aur Google Sheets me save hoga aur inventory automatically update ho jayegi.\n\nTimeline **2-3 weeks** hai. Mazeed detail ke liye: [Book a Free Call](/contact) ya [View Pricing](/pricing).`;
    }
    return `### 🍽️ Smart WhatsApp Ordering + Kitchen Thermal Printing\n\nYes, absolutely! We build end-to-end automated ordering systems:\n\n• **Customer Order Bot:** Customers browse menus, select items, or send voice notes via WhatsApp Cloud API (transcribed via Whisper AI).\n• **Automated Kitchen Printing:** Orders instantly trigger an n8n webhook relay to your kitchen's ESC/POS network thermal printer for immediate food prep.\n• **Live Stock & CRM Sync:** Dispatches alerts and logs order records into your database/Google Sheets in real time.\n\nTimeline is **2-3 weeks** under our **Growth System ($1,299)**. Let's scope it: [Book a Free Call](/contact) or [View Pricing](/pricing).`;
  }

  // 13. OUT-OF-THE-BOX / OUGHT 3: Document AI / PDF Invoice Extraction
  if (query.includes("pdf") || query.includes("invoice") || query.includes("ocr") || query.includes("quickbooks") || query.includes("xero")) {
    return `### 📄 Document AI & Automated Invoice Processing\n\nYes! We build automated Document AI pipelines using n8n and vision/OCR models:\n• **Auto-Ingestion:** Automatically monitors inbound emails (Gmail/Outlook) or Dropbox for supplier PDF invoices.\n• **Intelligent Extraction:** Extracts vendor names, line items, quantities, taxes, and totals with 99%+ accuracy.\n• **Accounting Sync:** Posts structured data directly into QuickBooks, Xero, or Google Sheets without manual entry.\n\nTypically saves businesses 15-20+ hours of manual bookkeeping per week. Quoted under **Growth System ($1,299)** or custom scope. [Book a Free Call](/contact) or [View Pricing](/pricing).`;
  }

  // 14. OUT-OF-THE-BOX / OUGHT 4: WordPress/Shopify vs Custom Next.js
  if (query.includes("wordpress") || query.includes("shopify vs") || query.includes("why next.js") || query.includes("why nextjs")) {
    return `### ⚡ Next.js 14 vs WordPress/Shopify\n\nWhile WordPress is good for standard blogs, modern businesses choose custom **Next.js 14** web apps built by CognitoByte for 3 big reasons:\n\n1. **Blazing Speed & SEO:** Sub-second page loads give you 95+ Google PageSpeed scores, reducing ad bounce rates.\n2. **Zero Plugin Lock-in:** No bloated plugins that slow down your site or get hacked.\n3. **Native AI Integration:** Seamlessly connect AI chatbots, background workers, and custom APIs that WordPress can't handle.\n\n*Note:* If you already use Shopify, we can build custom headless Next.js storefronts on top of it! [View Projects](/projects) or [Book a Free Call](/contact).`;
  }

  // 15. OUT-OF-THE-BOX / OUGHT 5: AI Hallucination & Risk Prevention
  if (query.includes("hallucinat") || query.includes("wrong answer") || query.includes("insult") || query.includes("accuracy")) {
    return `### 🛡️ AI Guardrails & Anti-Hallucination Engineering\n\nWe design enterprise-grade safety guardrails to ensure your AI never gives inaccurate information:\n• **Strict RAG Architecture:** The AI is strictly anchored to your verified business documentation.\n• **Confidence Thresholds:** If customer intent is ambiguous or asks for unapproved discounts, the system safely routes to human support.\n• **Audit Logs:** Full telemetry so you can review every conversation.\n\nOur **Raasid bot** handled thousands of orders with zero hallucinations. Let's discuss your safety requirements: [Book a Free Call](/contact).`;
  }

  // 16. WhatsApp automation intent
  if (query.includes("whatsapp") || query.includes("wa bot")) {
    return `### 📱 WhatsApp Automation & Chatbots\n\nWe build custom **WhatsApp Cloud API** systems for customer support, order updates, COD confirmation, and cart recovery. For example, our **Raasid** bot recovered **~30%** of abandoned carts for a food brand.\n\n• **Starter Tier:** **$499** (Single core flow, 5-10 days)\n• **Growth Tier:** **$1,299** (Multi-tool integration + cart recovery + CRM sync, 2-3 weeks)\n\nWhich tools should it connect with (Shopify, WooCommerce, Sheets)? [Explore Services](/services) · [Contact & Order](/contact) · [Book a Free Call](/contact).`;
  }

  // 17. n8n / workflow automation intent
  if (query.includes("n8n") || query.includes("automation") || query.includes("automate") || query.includes("workflow") || query.includes("zapier") || query.includes("make.com")) {
    return `### ⚙️ Workflow Automation with n8n\n\nWe connect your tools to eliminate repetitive manual work — 400+ integrations including Shopify, Google Sheets, CRMs, Slack, and Stripe.\n\n• **Starter Tier:** **$499** (1 core workflow, 5-10 business days)\n• **Growth Tier:** **$1,299** (Multi-tool pipeline + AI logic, 2-3 weeks)\n\nWhich workflows would you like to automate? [Explore Services](/services) or [Contact & Order](/contact).`;
  }

  // 18. Web Development queries
  if (
    query.includes("web") ||
    query.includes("website") ||
    query.includes("mern") ||
    query.includes("next.js") ||
    query.includes("nextjs") ||
    query.includes("react") ||
    query.includes("ecommerce") ||
    query.includes("full stack") ||
    query.includes("fullstack")
  ) {
    return `### 💻 Full-Stack Web Development\n\nWe build high-performance web applications using **Next.js 14**, **React**, **MERN Stack**, and **TypeScript**.\n\n• **Featured Case Studies:** [Pharma-Ease](/projects/pharma-ease-pharmacy-platform) (Stripe + Groq AI) and [IlyasKaGpt](/projects/ilyaskagpt-offline-ai-assistant)\n• **Timeline:** **4-8 weeks** (MVPs in 2-3 weeks)\n\nWhat kind of web platform are you looking to launch? [View Projects](/projects) or [Contact & Order](/contact).`;
  }

  // 19. Generic chatbot intent
  if (query.includes("chatbot") || query.includes("chat bot") || /\bbot\b/.test(query)) {
    if (query.includes("website") || query.includes("web")) {
      return `Yes, we build custom **Website Chatbots** trained on your business knowledge! They can answer FAQs, capture qualified leads, and sync conversations to your CRM.\n\n• **Timeline:** **2-3 weeks**\n• **Pricing:** Starting at **$499**\n\nReady to get started? [View Pricing](/pricing) or [Contact & Order](/contact).`;
    }
    return `### 🤖 Custom AI Chatbots\n\nYes! We build intelligent chatbots for both websites and WhatsApp to handle 24/7 customer support, capture leads, and route inquiries.\n\nDo you need the chatbot for your website, WhatsApp, or both? [Explore Services](/services) · [Contact & Order](/contact)`;
  }

  // 20. Where to place order or schedule call
  if (query.includes("place an order") || query.includes("schedule a call") || query.includes("book") || query.includes("hire") || query.includes("get started")) {
    return `You can get started immediately! To schedule a free 30-minute discovery call with our engineering team or submit your project details, visit our [Contact & Order](/contact) page or review our package details at [View Pricing](/pricing).`;
  }

  // 21. All projects query
  if (query.includes("project") || query.includes("portfolio") || query.includes("work") || query.includes("case stud")) {
    return `### 🏆 CognitoByte Portfolio\n\n• **Web Development:** Next.js 14, MERN Stack ([Pharma-Ease](/projects/pharma-ease-pharmacy-platform), [IlyasKaGpt](/projects/ilyaskagpt-offline-ai-assistant))\n• **n8n Automation:** Automated social content engines and CRM sync\n• **Chatbots:** WhatsApp & Web customer assistants (e.g. Raasid bot)\n\n[Explore All Projects](/projects) · [Book a Free Call](/contact) to discuss your project.`;
  }

  // 22. Services query
  if (query.includes("service") || query.includes("what do you do") || query.includes("what can you build") || query.includes("offer")) {
    return `### ⚡ CognitoByte Core Services\n\n• **Full-Stack Web Apps:** Next.js 14, MERN, React, TypeScript.\n• **Custom AI Chatbots:** Website & WhatsApp assistants with CRM sync.\n• **n8n Workflow Automation:** Connect 400+ apps to remove manual bottlenecks.\n• **Autonomous AI Agents:** Multi-step decision and execution agents.\n\nWhich service can we help you with? [Explore Services](/services) or [Contact & Order](/contact).`;
  }

  // 23. Ambiguous query clarification ("help", short strings)
  if (query.length < 5 || query === "help" || query === "yes" || query === "no" || query === "ok" || query === "sure") {
    if (isRomanUrdu) {
      return `Aap humein thora mazeed bata sakte hain ke aap kya build ya automate karna chahte hain, taake hum sahi solution suggest karein? Ya direct hamare team se [Book a Free Call](/contact) par rabta karein.`;
    }
    return `Could you tell me a little more about what you'd like to build or automate so I can guide you to the right solution? Or feel free to [Book a Free Call](/contact) with our team.`;
  }

  // 24. Default consultative response
  if (isRomanUrdu) {
    return `### Khush Amdeed! CognitoByte me welcome 👋\n\nHum **Full-Stack Web Apps** (Next.js 14, MERN) aur **AI Automations** (n8n, WhatsApp Bots, Website Assistants) banate hain.\n\nAap apne business ke liye kya banana ya automate karna chahte hain? [Explore Services](/services) · [Contact & Order](/contact)`;
  }

  return `### Hi! Welcome to CognitoByte 👋\n\nWe build **full-stack web apps** (Next.js, MERN) and **AI automations** (n8n, WhatsApp bots, website chatbots).\n\nAre you looking to build a new web application, automate a business workflow, or deploy an AI chatbot? [Explore Services](/services) · [Contact & Order](/contact)`;
}

/* ─────────────────────────────────────────────
   Vercel AI SDK DataStream Helper
───────────────────────────────────────────── */
function toDataStreamResponse(text: string) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(formatStreamPart("text", text)));
      controller.enqueue(
        encoder.encode(
          formatStreamPart("finish_message", {
            finishReason: "stop",
            usage: { promptTokens: 0, completionTokens: 0 },
          })
        )
      );
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}

/* ─────────────────────────────────────────────
   POST API Handler
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages payload." }, { status: 400 });
    }

    const isStream = req.headers.get("x-ai-stream") === "true";
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const token = getTokenFromRequest(req);
    const payload = token ? verifyToken(token) : null;
    const isAdmin = payload?.role === "admin";

    const [knowledge, projects, services] = await Promise.all([
      buildKnowledge(),
      getProjectsFromDb(),
      getServicesFromDb(),
    ]);

    let adminData = "";
    if (isAdmin) {
      adminData = await buildAdminData();
    }

    let systemPrompt = `${SALESGPT_SYSTEM_PROMPT}\n\n${knowledge}`;
    if (isAdmin) {
      systemPrompt += `\n\nADMIN LIVE DATA:\n${adminData}`;
    }

    const recentMessages: ChatHistoryMessage[] = messages.slice(-15).map((m: any) => ({
      role: (m.role === "assistant" || m.role === "user" ? m.role : "user") as "user" | "assistant",
      content: String(m.content || ""),
    }));

    const olderMessages: ChatHistoryMessage[] = messages.slice(0, -15).map((m: any) => ({
      role: (m.role === "assistant" || m.role === "user" ? m.role : "user") as "user" | "assistant",
      content: String(m.content || ""),
    }));

    if (olderMessages.length > 0) {
      systemPrompt += `\n\n${buildRollingSummary(olderMessages)}`;
    }

    let responseText = "";

    // Try Groq LLM first if key is configured
    const groq = getGroqClient();
    if (groq) {
      try {
        const groqCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...recentMessages,
          ],
          max_tokens: isAdmin ? 450 : 800,
          temperature: 0.3,
        });

        responseText = groqCompletion.choices[0]?.message?.content || "";
      } catch (groqErr) {
        // Fallback to fast 8B model if 70B fails
        try {
          const groqFallback = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              ...recentMessages,
            ],
            max_tokens: isAdmin ? 450 : 800,
            temperature: 0.3,
          });
          responseText = groqFallback.choices[0]?.message?.content || "";
        } catch {
          // Both Groq calls failed; proceed to consultative fallback engine
        }
      }
    }

    // If Groq gave empty text or failed, use our SalesGPT Consultative Engine
    if (!responseText.trim()) {
      responseText = generateFallbackResponse(
        lastUserMessage,
        messages,
        projects,
        services,
        isAdmin,
        adminData
      );
    }

    if (isStream) {
      return toDataStreamResponse(responseText);
    }

    return NextResponse.json({ message: responseText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    const fallbackText = "I am ready to help with your web development and AI automation questions! Ask me about our projects (like Pharma-Ease, Raasid WhatsApp bot, or IlyasKaGpt), services, or pricing.";
    if (req.headers.get("x-ai-stream") === "true") {
      return toDataStreamResponse(fallbackText);
    }
    return NextResponse.json({ message: fallbackText });
  }
}

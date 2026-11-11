import { NextRequest, NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { createXai } from "@ai-sdk/xai";
import { z } from "zod";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";

// In-memory rate limiting to protect Grok usage: max 30 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function getXaiModel() {
  const apiKey =
    process.env.XAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Grok API key is missing. Set XAI_API_KEY or GROQ_API_KEY in your environment variables."
    );
  }

  const xai = createXai({ apiKey });
  return xai("grok-beta");
}

/* ─────────────────────────────────────────────
   System Prompt
───────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are the sales and support AI assistant for CognitoByte (https://cognitobyte.com), an agency specializing in AI Automation, Autonomous Agents, Custom Chatbots, and Full-Stack Web Development.

CORE BEHAVIOR RULES:
1. Keep answers SHORT and SIMPLE (1-3 sentences or a few compact bullet points). Never write long essays or fluff.
2. For small talk (e.g., "hi", "how are you?") or vague requests (e.g., "I need a website ASAP", "I need an app"):
   - Reply directly and friendly.
   - Ask what type of website/automation/system they need.
3. For specific service or project questions (e.g., "Do you make WordPress websites?", "Do you build WhatsApp bots?", "Have you made pharmacy apps?"):
   - ALWAYS call the \`searchProjects\` tool first with a targeted keyword (e.g. "wordpress", "whatsapp", "pharmacy").
   - IF FOUND in search results: say yes clearly, give 1-2 short examples directly from the returned data, and share the relevant page link ([Explore Services](/services), [View Projects](/projects), [View Pricing](/pricing), or [Contact Us](/contact)).
   - IF NOT FOUND in search results: say clearly that we don't offer that (e.g. "We don't build WordPress sites — we build custom full-stack web applications with Next.js 14 and React"), and give 1-2 examples of what we do build from our actual stack.
4. STRICT TRUTH RULE: Never claim a service, tool, feature, or project unless the \`searchProjects\` tool confirms it. Never invent details, prices, or links.
5. If the user expresses strong interest in working together, politely offer to connect them via [Book a Free Call](/contact) or ask for their name and email so our team can follow up.`;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages payload." }, { status: 400 });
    }

    // Read-only searchProjects tool querying database
    const searchProjectsTool = tool({
      description:
        "Searches CognitoByte database for matching services and portfolio projects by keyword. Call this tool whenever the user asks about specific technologies, tools, platforms, or project capabilities.",
      parameters: z.object({
        keyword: z
          .string()
          .min(1)
          .max(80)
          .describe("Target search keyword e.g. 'WordPress', 'WhatsApp', 'pharmacy', 'Next.js', 'n8n'"),
      }),
      execute: async ({ keyword }) => {
        try {
          const cleanKeyword = keyword
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .trim();

          if (!cleanKeyword) {
            return { found: false, count: 0, results: [] };
          }

          const db = await getMongoDb();
          const regexQuery = { $regex: cleanKeyword, $options: "i" };

          // Safe, parameterized read-only queries with strict limits
          const [matchedServices, matchedProjects] = await Promise.all([
            db
              .collection("services")
              .find(
                {
                  isActive: { $ne: false },
                  $or: [
                    { title: regexQuery },
                    { description: regexQuery },
                    { shortDescription: regexQuery },
                    { features: regexQuery },
                  ],
                },
                {
                  projection: {
                    title: 1,
                    shortDescription: 1,
                    description: 1,
                    features: 1,
                    slug: 1,
                  },
                }
              )
              .limit(3)
              .toArray(),
            db
              .collection("projects")
              .find(
                {
                  isActive: { $ne: false },
                  $or: [
                    { title: regexQuery },
                    { description: regexQuery },
                    { shortDescription: regexQuery },
                    { tags: regexQuery },
                    { category: regexQuery },
                  ],
                },
                {
                  projection: {
                    title: 1,
                    shortDescription: 1,
                    description: 1,
                    tags: 1,
                    slug: 1,
                    category: 1,
                  },
                }
              )
              .limit(3)
              .toArray(),
          ]);

          const results = [
            ...matchedServices.map((s: any) => ({
              type: "service",
              title: s.title,
              description: s.shortDescription || s.description?.slice(0, 160) || "",
              examples: Array.isArray(s.features) ? s.features.slice(0, 3) : [],
            })),
            ...matchedProjects.map((p: any) => ({
              type: "project",
              title: p.title,
              description: p.shortDescription || p.description?.slice(0, 160) || "",
              examples: Array.isArray(p.tags) ? p.tags.slice(0, 3) : [],
            })),
          ].slice(0, 5);

          return {
            found: results.length > 0,
            count: results.length,
            keyword,
            results,
          };
        } catch (dbErr) {
          console.error("Database searchProjects error:", dbErr);
          return { found: false, count: 0, results: [], error: "Search unavailable" };
        }
      },
    });

    const model = getXaiModel();

    // Stream text using Vercel AI SDK and Grok (xAI) with searchProjects tool
    const result = await streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      maxSteps: 3,
      tools: {
        searchProjects: searchProjectsTool,
      },
      temperature: 0.2,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API Grok route error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process chat message.",
      },
      { status: 500 }
    );
  }
}

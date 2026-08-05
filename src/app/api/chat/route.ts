import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getBlogPosts, getPricingFromDb, getProjectsFromDb, getServicesFromDb } from "@/lib/data";

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is missing");
  return new Groq({ apiKey: key });
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for CognitoByte, an AI automation agency.

You ONLY answer questions about CognitoByte's services, pricing, projects, blog posts, process, and team.

If someone asks something unrelated to CognitoByte (e.g., general coding questions, personal advice, other companies), politely say: "I'm trained specifically to help with questions about CognitoByte. For that topic, I'd suggest a general search engine. Is there anything about our services or pricing I can help with?"

Keep answers concise, helpful, and professional. Use bullet points when listing things.

KNOWLEDGE BASE:
{knowledge}`;

async function buildKnowledge(): Promise<string> {
  const [services, pricing, projects, blog] = await Promise.all([
    getServicesFromDb(), getPricingFromDb(), getProjectsFromDb(), getBlogPosts(),
  ]);

  let knowledge = "SERVICES:\n";
  if (services?.length) {
    knowledge += services
      .map((s: any) => {
        const features = s.features?.length ? `\n  Features: ${s.features.join(", ")}` : "";
        return `- ${s.title}: ${s.shortDescription || ""}${features}`;
      })
      .join("\n");
  }

  knowledge += "\n\nPRICING:\n";
  if (pricing?.length) {
    knowledge += pricing
      .map((p: any) => {
        const features = p.features?.length ? `\n  Includes: ${p.features.join(", ")}` : "";
        return `- ${p.name}: ${p.price || "Custom"}${p.period || ""} — ${p.description || ""}${features}`;
      })
      .join("\n");
  }

  knowledge += "\n\nPROCESS:\n1. Discovery Call (free) — We learn about your business\n2. Workflow Design — We map the automation\n3. Build & Test — We build and test thoroughly\n4. Handoff — You get full access and documentation\n5. Support — Ongoing maintenance available";

  knowledge += "\n\nRECENT PROJECTS:\n";
  if (projects?.length) {
    projects.slice(0, 5).forEach((p: any) => {
      knowledge += `- ${p.title} (${p.category || "N/A"}): ${p.shortDescription || ""}\n`;
    });
  }

  knowledge += "\n\nBLOG POSTS:\n";
  if (blog?.length) {
    blog.slice(0, 5).forEach((b: any) => {
      knowledge += `- ${b.title} (${b.category || "N/A"}): ${b.excerpt || ""}\n`;
    });
  }

  knowledge += "\n\nCONTACT:\nEmail us at automations@cognitobyte.com or fill out the contact form on our website.";

  return knowledge;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const knowledge = await buildKnowledge();
    const systemPrompt = SYSTEM_PROMPT.replace("{knowledge}", knowledge);
    const recentMessages = messages.slice(-10);

    let message: string;
    try {
      const groq = getGroq();
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        max_tokens: 500,
        temperature: 0.7,
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

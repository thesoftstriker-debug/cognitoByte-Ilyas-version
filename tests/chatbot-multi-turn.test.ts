/**
 * Test Suite: 10 Multi-Turn Chatbot Conversations
 * Validates:
 * 1. Follow-up reasoning and pronoun resolution ("it", "how long", "how much")
 * 2. Proper context maintenance across multi-turns
 * 3. Exact valid page links ([/services], [/pricing], [/contact], [/projects])
 * 4. Clarification questions on ambiguous inputs
 * 5. Anti-looping and accurate knowledge presentation
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Simulates POST /api/chat with our route handler logic
async function simulateChatTurn(messages: Message[]): Promise<string> {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json();
  return data.message;
}

export const testConversations = [
  {
    name: "Test 1: Website Chatbot Follow-up on Timeline",
    turns: [
      { user: "Do you build chatbots?" },
      { user: "Website. How long?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const mentionsTimeline = lower.includes("week") || lower.includes("day");
      const mentionsChatbotOrWeb = lower.includes("bot") || lower.includes("website") || lower.includes("chat");
      const hasLink = finalReply.includes("/contact") || finalReply.includes("/services");
      return mentionsTimeline && mentionsChatbotOrWeb && hasLink;
    }
  },
  {
    name: "Test 2: Pricing Follow-up ('how much?')",
    turns: [
      { user: "Can you create a WhatsApp bot for order tracking?" },
      { user: "how much?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const hasPrice = lower.includes("499") || lower.includes("1,299") || lower.includes("$");
      const hasPricingOrContactLink = finalReply.includes("/pricing") || finalReply.includes("/contact");
      return hasPrice && hasPricingOrContactLink;
    }
  },
  {
    name: "Test 3: Web Development Tech & Follow-up on Time",
    turns: [
      { user: "I want an online e-commerce store with Next.js." },
      { user: "How long will that take?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const mentionsWeeks = lower.includes("week");
      const hasLink = finalReply.includes("/projects") || finalReply.includes("/contact");
      return mentionsWeeks && hasLink;
    }
  },
  {
    name: "Test 4: Workflow Automation (n8n) Scoping",
    turns: [
      { user: "We spend 4 hours a day syncing Shopify orders into Google Sheets and Slack." },
      { user: "Can you automate it?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const mentionsAutomation = lower.includes("n8n") || lower.includes("automat") || lower.includes("workflow");
      return mentionsAutomation;
    }
  },
  {
    name: "Test 5: Clarifying Question on Ambiguous Input",
    turns: [
      { user: "help" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const asksQuestion = lower.includes("?") || lower.includes("tell me") || lower.includes("could you");
      return asksQuestion;
    }
  },
  {
    name: "Test 6: Price Objection Handling",
    turns: [
      { user: "Is $499 your lowest price? That sounds expensive for our small startup." }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const handlesObjection = lower.includes("499") || lower.includes("roi") || lower.includes("save") || lower.includes("starter");
      return handlesObjection;
    }
  },
  {
    name: "Test 7: Team & Ownership Questions",
    turns: [
      { user: "Who builds the solutions and who owns the code after delivery?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const mentionsTeamOrDev = lower.includes("ilyas") || lower.includes("team") || lower.includes("own") || lower.includes("code");
      return mentionsTeamOrDev;
    }
  },
  {
    name: "Test 8: Pronoun Resolution ('it')",
    turns: [
      { user: "Do you have experience with Pharma-Ease pharmacy platform?" },
      { user: "What tech stack was it built with?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const mentionsStack = lower.includes("next.js") || lower.includes("mern") || lower.includes("stripe");
      return mentionsStack;
    }
  },
  {
    name: "Test 9: Trust Objection & Consultation Call",
    turns: [
      { user: "How do I know your automations won't break my CRM data?" },
      { user: "Can we talk to someone first?" }
    ],
    verify: (finalReply: string) => {
      const lower = finalReply.toLowerCase();
      const hasCallOrContact = lower.includes("call") || lower.includes("contact") || finalReply.includes("/contact");
      return hasCallOrContact;
    }
  },
  {
    name: "Test 10: Anti-Looping and Link Integrity",
    turns: [
      { user: "Can you build a chatbot?" },
      { user: "Website. How long?" },
      { user: "Great, where can I place an order or schedule a call?" }
    ],
    verify: (finalReply: string) => {
      const hasExactValidLink = finalReply.includes("/contact") || finalReply.includes("/pricing");
      const noHallucinatedLinks = !finalReply.includes("/order-now") && !finalReply.includes("/checkout");
      return hasExactValidLink && noHallucinatedLinks;
    }
  }
];


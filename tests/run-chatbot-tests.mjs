import fs from "fs";
import ts from "typescript";

const testConversations = [
  {
    name: "Test 1: Website Chatbot Follow-up on Timeline",
    turns: [
      { user: "Do you build chatbots?" },
      { user: "Website. How long?" }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const mentionsTimeline = lower.includes("week") || lower.includes("day");
      const mentionsChatbotOrWeb = lower.includes("bot") || lower.includes("website") || lower.includes("chat");
      const hasLink = reply.includes("/contact") || reply.includes("/services");
      return mentionsTimeline && mentionsChatbotOrWeb && hasLink;
    }
  },
  {
    name: "Test 2: Pricing Follow-up ('how much?')",
    turns: [
      { user: "Can you create a WhatsApp bot for order tracking?" },
      { user: "how much?" }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const hasPrice = lower.includes("499") || lower.includes("1,299") || lower.includes("$");
      const hasPricingOrContactLink = reply.includes("/pricing") || reply.includes("/contact");
      return hasPrice && hasPricingOrContactLink;
    }
  },
  {
    name: "Test 3: Web Development Tech & Follow-up on Time",
    turns: [
      { user: "I want an online e-commerce store with Next.js." },
      { user: "How long will that take?" }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const mentionsWeeks = lower.includes("week");
      const hasLink = reply.includes("/projects") || reply.includes("/contact");
      return mentionsWeeks && hasLink;
    }
  },
  {
    name: "Test 4: Workflow Automation (n8n) Scoping",
    turns: [
      { user: "We spend 4 hours a day syncing Shopify orders into Google Sheets and Slack." },
      { user: "Can you automate it?" }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const mentionsAutomation = lower.includes("n8n") || lower.includes("automat") || lower.includes("workflow");
      return mentionsAutomation;
    }
  },
  {
    name: "Test 5: Clarifying Question on Ambiguous Input",
    turns: [
      { user: "help" }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const asksQuestion = lower.includes("?") || lower.includes("tell me") || lower.includes("could you");
      return asksQuestion;
    }
  },
  {
    name: "Test 6: Price Objection Handling",
    turns: [
      { user: "Is $499 your lowest price? That sounds expensive for our small startup." }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const handlesObjection = lower.includes("499") || lower.includes("starter") || lower.includes("pricing") || reply.includes("/pricing");
      return handlesObjection;
    }
  },
  {
    name: "Test 7: Team & Ownership Questions",
    turns: [
      { user: "Who builds the solutions and who owns the code after delivery?" }
    ],
    verify: (reply) => {
      const lower = reply.toLowerCase();
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
    verify: (reply) => {
      const lower = reply.toLowerCase();
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
    verify: (reply) => {
      const lower = reply.toLowerCase();
      const hasCallOrContact = lower.includes("call") || lower.includes("contact") || reply.includes("/contact");
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
    verify: (reply) => {
      const hasExactValidLink = reply.includes("/contact") || reply.includes("/pricing");
      const noHallucinatedLinks = !reply.includes("/order-now") && !reply.includes("/checkout");
      return hasExactValidLink && noHallucinatedLinks;
    }
  }
];

// Transpile TS snippet using typescript
const file = fs.readFileSync("src/app/api/chat/route.ts", "utf8");
const fnStartIndex = file.indexOf("function buildRollingSummary");
const fnEndIndex = file.indexOf("export async function POST");
const rawTsCode = file.substring(fnStartIndex, fnEndIndex);

const jsCode = ts.transpileModule(rawTsCode, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;

const tempRunner = `
${jsCode}

export function testRun(lastUser, history) {
  return generateFallbackResponse(lastUser, history, [], [], false, "");
}
`;

fs.writeFileSync("tests/temp-runner.mjs", tempRunner);

const { testRun } = await import("./temp-runner.mjs");

console.log("=================================================");
console.log("RUNNING 10 MULTI-TURN CHATBOT CONVERSATION TESTS");
console.log("=================================================\n");

let passed = 0;
for (let i = 0; i < testConversations.length; i++) {
  const test = testConversations[i];
  console.log(`[TEST ${i + 1}/10] ${test.name}`);

  const history = test.turns.map(t => ({ role: "user", content: t.user }));
  const lastUser = history[history.length - 1].content;

  const botResponse = testRun(lastUser, history);

  console.log(`  Bot Output Preview: "${botResponse.slice(0, 95).replace(/\n/g, ' ')}..."`);

  const isValid = test.verify(botResponse);
  if (isValid) {
    console.log(`  Status: PASS ✅\n`);
    passed++;
  } else {
    console.error(`  Status: FAIL ❌\n  Full response:\n${botResponse}\n`);
  }
}

// Cleanup temp file
fs.unlinkSync("tests/temp-runner.mjs");

console.log("=================================================");
console.log(`RESULTS: ${passed}/${testConversations.length} TESTS PASSED`);
console.log("=================================================");

if (passed !== testConversations.length) {
  process.exit(1);
}

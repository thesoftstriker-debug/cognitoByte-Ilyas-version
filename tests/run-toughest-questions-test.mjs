import fs from "fs";
import ts from "typescript";

// Read and transpile from src/app/api/chat/route.ts
const file = fs.readFileSync("src/app/api/chat/route.ts", "utf8");
const fnStartIndex = file.indexOf("function buildRollingSummary");
const fnEndIndex = file.indexOf("function toDataStreamResponse");
const rawTsCode = file.substring(fnStartIndex, fnEndIndex);

const jsCode = ts.transpileModule(rawTsCode, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;

const runnerCode = `
${jsCode}

export function askBot(query, history = []) {
  const fullHistory = [...history, { role: "user", content: query }];
  return generateFallbackResponse(query, fullHistory, [], [], false, "");
}
`;

fs.writeFileSync("tests/temp-tough-runner.mjs", runnerCode);
const { askBot } = await import("./temp-tough-runner.mjs");

const toughScenarios = [
  {
    name: "Tough Q1: Wholesale Meat & Cold Room Thermal Printer (IoT / Voice / Out-of-the-box)",
    query: "Can your system take orders via voice notes on WhatsApp from butchers in Urdu, calculate live stock, and print invoices directly in the cold room thermal printer without anyone touching a keyboard?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const hasPrinter = lower.includes("printer") || lower.includes("kitchen");
      const hasWhatsapp = lower.includes("whatsapp");
      const hasCTA = res.includes("/contact") || res.includes("/pricing");
      return hasPrinter && hasWhatsapp && hasCTA;
    }
  },
  {
    name: "Tough Q2: Roman Urdu Skeptical Objection (Scam / Advance fear)",
    query: "yar tum log advance 50% lete ho agar bhaag gaye to mera paisa zaya ho jayega",
    validate: (res) => {
      const lower = res.toLowerCase();
      const addressesTrust = lower.includes("aitmaad") || lower.includes("milestone") || lower.includes("transparent") || lower.includes("ownership");
      const hasCall = res.includes("/contact");
      return addressesTrust && hasCall;
    }
  },
  {
    name: "Tough Q3: Competitor Scraping & Dynamic Price Undercutting",
    query: "Can your bot scrape 10 competitor websites every 15 minutes, monitor price changes, and automatically undercut their price by 2% on my Shopify store?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const explainsScraping = lower.includes("scrape") || lower.includes("crawlers") || lower.includes("dynamic");
      const mentionsShopifyOrPricing = lower.includes("shopify") || lower.includes("pricing") || lower.includes("growth");
      return explainsScraping && mentionsShopifyOrPricing;
    }
  },
  {
    name: "Tough Q4: AI Hallucination & Financial Liability Fear",
    query: "What if your chatbot hallucinates and tells my customer a $500 product is $5 or insults an angry customer?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const handlesSafety = lower.includes("guardrail") || lower.includes("rag") || lower.includes("human");
      const hasProof = lower.includes("raasid") || lower.includes("hallucinat");
      return handlesSafety && hasProof;
    }
  },
  {
    name: "Tough Q5: Cheap Freelancer Trap ($50 Fiverr vs $499 Starter)",
    query: "Why should I pay you $499 or $1299 when a Pakistani freelancer on Fiverr offered to make me a bot for $50?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const explainsValue = lower.includes("499") || lower.includes("roi") || lower.includes("support") || lower.includes("freelancer");
      const hasLink = res.includes("/pricing") || res.includes("/contact");
      return explainsValue && hasLink;
    }
  },
  {
    name: "Tough Q6: Roman Urdu Restaurant Kitchen Order Workflow",
    query: "bhai mujhe aik aisi website chahiye jo mere restaurant k orders whatsapp pe le or kitchen k printer pe print kare, kya ye ho skta ha?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const isUrduReply = lower.includes("ji bilkul") || lower.includes("printer") || lower.includes("restaurant");
      const hasNextStep = res.includes("/contact") || res.includes("/pricing");
      return isUrduReply && hasNextStep;
    }
  },
  {
    name: "Tough Q7: Automated PDF Invoice Parsing into QuickBooks",
    query: "Can we automate extracting data from 500 PDF supplier invoices each month and pushing line items into QuickBooks without manual typing?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const addressesOCR = lower.includes("pdf") || lower.includes("document ai") || lower.includes("quickbooks") || lower.includes("invoice");
      const hasCTA = res.includes("/contact") || res.includes("/pricing");
      return addressesOCR && hasCTA;
    }
  },
  {
    name: "Tough Q8: WordPress / WooCommerce vs Next.js 14",
    query: "My friend told me WordPress with WooCommerce and free plugins is 100 times better and cheaper than your Next.js. Why would anyone pay you?",
    validate: (res) => {
      const lower = res.toLowerCase();
      const comparesStack = lower.includes("speed") || lower.includes("next.js") || lower.includes("plugin");
      const hasProjectsLink = res.includes("/projects") || res.includes("/contact");
      return comparesStack && hasProjectsLink;
    }
  }
];

console.log("=================================================");
console.log("TESTING 8 TOUGHEST & ROUNDING QUESTIONS (SALESGPT)");
console.log("=================================================\n");

let passedCount = 0;

for (let i = 0; i < toughScenarios.length; i++) {
  const scenario = toughScenarios[i];
  console.log(`[TOUGH TEST ${i + 1}/${toughScenarios.length}] ${scenario.name}`);
  console.log(`  User: "${scenario.query}"`);

  const response = askBot(scenario.query);
  console.log(`  Bot Answer:\n  ${response.slice(0, 160).replace(/\n/g, ' ')}...`);

  const ok = scenario.validate(response);
  if (ok) {
    console.log(`  Result: PASSED & NOT CONFUSED ✅\n`);
    passedCount++;
  } else {
    console.error(`  Result: FAILED ❌\n  Full response:\n${response}\n`);
  }
}

// Cleanup
fs.unlinkSync("tests/temp-tough-runner.mjs");

console.log("=================================================");
console.log(`FINAL STRESS TEST RESULT: ${passedCount}/${toughScenarios.length} TOUGH SCENARIOS PASSED`);
console.log("=================================================");

if (passedCount !== toughScenarios.length) {
  process.exit(1);
}

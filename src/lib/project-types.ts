export type ProjectCategory = "n8n" | "ai-agent" | "chatbot" | "workflow";

export const PROJECT_CATEGORIES: { label: string; value: ProjectCategory }[] = [
  { label: "n8n Automation", value: "n8n" },
  { label: "AI Agent", value: "ai-agent" },
  { label: "Chatbot", value: "chatbot" },
  { label: "Workflow Design", value: "workflow" },
];

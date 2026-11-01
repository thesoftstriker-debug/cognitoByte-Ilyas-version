import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

/** Returns true if the URL is a direct video file (Cloudinary, S3, etc.) */
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  // Must not be a YouTube link
  if (/youtube\.com|youtu\.be/.test(url)) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("cloudinary.com/") && url.includes("/video/");
}
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export const CATEGORY_LABELS: Record<string, string> = {
  n8n: "n8n Automation",
  "ai-agent": "AI Agent",
  chatbot: "Chatbot",
  workflow: "Workflow Design",
};

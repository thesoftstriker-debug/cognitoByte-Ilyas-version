import { readFileSync } from "fs";
import { join } from "path";
import { getMongoDb } from "./mongodb";

const DATA_DIR = join(process.cwd(), "src", "data");

function loadJSON<T>(file: string): T[] {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
  } catch {
    return [];
  }
}

export function getServices() {
  return loadJSON<any>("service.json");
}

export function getServiceBySlug(slug: string) {
  return getServices().find((s: any) => s.slug === slug) || null;
}

export function getProjects() {
  return loadJSON<any>("project.json");
}

export function getProjectBySlug(slug: string) {
  return getProjects().find((p: any) => p.slug === slug) || null;
}

export function getPricing() {
  return loadJSON<any>("pricing.json");
}

export async function getServicesFromDb() {
  try {
    const db = await getMongoDb();
    return await db.collection("services").find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray();
  } catch {
    return getServices();
  }
}

export async function getServiceBySlugFromDb(slug: string) {
  try {
    const db = await getMongoDb();
    return await db.collection("services").findOne({ slug, isActive: true });
  } catch {
    return getServiceBySlug(slug);
  }
}

export async function getProjectsFromDb() {
  try {
    const db = await getMongoDb();
    return await db.collection("projects").find({ isActive: true }).sort({ publishedAt: -1, createdAt: -1 }).toArray();
  } catch {
    return getProjects();
  }
}

export async function getProjectBySlugFromDb(slug: string) {
  try {
    const db = await getMongoDb();
    return await db.collection("projects").findOne({ slug, isActive: true });
  } catch {
    return getProjectBySlug(slug);
  }
}

export async function getPricingFromDb() {
  try {
    const db = await getMongoDb();
    return await db.collection("pricing").find({ isActive: true }).sort({ order: 1 }).toArray();
  } catch {
    return getPricing();
  }
}

export async function getBlogPosts() {
  try {
    const db = await getMongoDb();
    return await db.collection("blogs").find({ isActive: true }).sort({ publishedAt: -1 }).toArray();
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const db = await getMongoDb();
    return await db.collection("blogs").findOne({ slug, isActive: true });
  } catch {
    return null;
  }
}

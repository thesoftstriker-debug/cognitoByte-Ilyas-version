import { getMongoDb } from "./mongodb";

export async function getServicesFromDb(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    return await db.collection("services").find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray();
  } catch {
    return [];
  }
}

export async function getServiceBySlugFromDb(slug: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    return await db.collection("services").findOne({ slug, isActive: true });
  } catch {
    return null;
  }
}

export async function getProjectsFromDb(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    return await db.collection("projects").find({ isActive: true }).sort({ publishedAt: -1, createdAt: -1 }).toArray();
  } catch {
    return [];
  }
}

export async function getProjectBySlugFromDb(slug: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    return await db.collection("projects").findOne({ slug, isActive: true });
  } catch {
    return null;
  }
}

export async function getPricingFromDb(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    return await db.collection("pricing").find({ isActive: true }).sort({ order: 1 }).toArray();
  } catch {
    return [];
  }
}

export async function getBlogPosts(sort: "new" | "old" = "new"): Promise<any[]> {
  try {
    const db = await getMongoDb();
    return await db
      .collection("blogs")
      .find({ isActive: true })
      .sort({ publishedAt: sort === "old" ? 1 : -1 })
      .toArray();
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    return await db.collection("blogs").findOne({ slug, isActive: true });
  } catch {
    return null;
  }
}

import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";
import type { ProjectCategory } from "../project-types";
import { PROJECT_CATEGORIES } from "../project-types";

export { PROJECT_CATEGORIES };

export interface ProjectDoc {
  _id?: ObjectId;
  title: string;
  slug: string;
  category: ProjectCategory | "";
  client: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  results: Array<{ metric: string; label: string }>;
  challenges: string;
  solution: string;
  tags: string[];
  publishedAt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createProject(
  project: Omit<ProjectDoc, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("projects").insertOne({
    ...project,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findAllProjects(
  search?: string,
  page = 1,
  limit = 10
) {
  const db = await getMongoDb();
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
      { client: { $regex: search, $options: "i" } },
    ];
  }
  const total = await db.collection("projects").countDocuments(query);
  const projects = await db
    .collection("projects")
    .find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { projects, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findProjectById(id: string) {
  const db = await getMongoDb();
  return db.collection("projects").findOne({ _id: new ObjectId(id) });
}

export async function updateProject(
  id: string,
  update: Partial<Omit<ProjectDoc, "_id" | "createdAt">>
) {
  const db = await getMongoDb();
  return db.collection("projects").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function deleteProjectById(id: string) {
  const db = await getMongoDb();
  return db.collection("projects").deleteOne({ _id: new ObjectId(id) });
}

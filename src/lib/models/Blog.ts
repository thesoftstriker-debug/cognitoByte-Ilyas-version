import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface BlogDoc {
  _id?: ObjectId;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  readTime: string;
  publishedAt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createBlog(
  blog: Omit<BlogDoc, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("blogs").insertOne({
    ...blog,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findAllBlogs(
  search?: string,
  page = 1,
  limit = 10
) {
  const db = await getMongoDb();
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }
  const total = await db.collection("blogs").countDocuments(query);
  const blogs = await db
    .collection("blogs")
    .find(query)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { blogs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findBlogById(id: string) {
  const db = await getMongoDb();
  return db.collection("blogs").findOne({ _id: new ObjectId(id) });
}

export async function findBlogBySlug(slug: string) {
  const db = await getMongoDb();
  return db.collection("blogs").findOne({ slug });
}

export async function updateBlog(
  id: string,
  update: Partial<Omit<BlogDoc, "_id" | "createdAt">>
) {
  const db = await getMongoDb();
  return db.collection("blogs").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function deleteBlogById(id: string) {
  const db = await getMongoDb();
  return db.collection("blogs").deleteOne({ _id: new ObjectId(id) });
}

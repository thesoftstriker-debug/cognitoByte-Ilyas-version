import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export type ProductCategory =
  | "Marketing & Copywriting"
  | "Content Creation"
  | "Business & Product Building"
  | "Creative & Visual Design";

export interface ProductDoc {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  fileUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createProduct(
  product: Omit<ProductDoc, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("products").insertOne({
    ...product,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findAllProducts(
  category?: string,
  search?: string,
  page = 1,
  limit = 12
) {
  const db = await getMongoDb();
  const query: Record<string, unknown> = { isActive: true };
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  const total = await db.collection("products").countDocuments(query);
  const products = await db
    .collection("products")
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findAllProductsAdmin(
  search?: string,
  page = 1,
  limit = 10
) {
  const db = await getMongoDb();
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  const total = await db.collection("products").countDocuments(query);
  const products = await db
    .collection("products")
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findProductBySlug(slug: string) {
  const db = await getMongoDb();
  return db.collection("products").findOne({ slug, isActive: true });
}

export async function findProductById(id: string) {
  const db = await getMongoDb();
  return db.collection("products").findOne({ _id: new ObjectId(id) });
}

export async function updateProduct(
  id: string,
  update: Partial<Omit<ProductDoc, "_id" | "createdAt">>
) {
  const db = await getMongoDb();
  return db.collection("products").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function deleteProductById(id: string) {
  const db = await getMongoDb();
  return db.collection("products").deleteOne({ _id: new ObjectId(id) });
}

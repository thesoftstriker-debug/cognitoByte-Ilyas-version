import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface PricingDoc {
  _id?: ObjectId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createPricingPlan(
  plan: Omit<PricingDoc, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("pricing").insertOne({
    ...plan,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findAllPricingPlans(
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
  const total = await db.collection("pricing").countDocuments(query);
  const plans = await db
    .collection("pricing")
    .find(query)
    .sort({ order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { pricing: plans, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findPricingById(id: string) {
  const db = await getMongoDb();
  return db.collection("pricing").findOne({ _id: new ObjectId(id) });
}

export async function updatePricingPlan(
  id: string,
  update: Partial<Omit<PricingDoc, "_id" | "createdAt">>
) {
  const db = await getMongoDb();
  return db.collection("pricing").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function deletePricingById(id: string) {
  const db = await getMongoDb();
  return db.collection("pricing").deleteOne({ _id: new ObjectId(id) });
}

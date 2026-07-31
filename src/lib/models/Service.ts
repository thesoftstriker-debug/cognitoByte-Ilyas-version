import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface ServiceDoc {
  _id?: ObjectId;
  title: string;
  slug: string;
  order: number;
  icon: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  features: string[];
  process: Array<{ step: string; title: string; description: string }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createService(
  service: Omit<ServiceDoc, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("services").insertOne({
    ...service,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findAllServices(
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
    ];
  }
  const total = await db.collection("services").countDocuments(query);
  const services = await db
    .collection("services")
    .find(query)
    .sort({ order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { services, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findServiceById(id: string) {
  const db = await getMongoDb();
  return db.collection("services").findOne({ _id: new ObjectId(id) });
}

export async function updateService(
  id: string,
  update: Partial<Omit<ServiceDoc, "_id" | "createdAt">>
) {
  const db = await getMongoDb();
  return db.collection("services").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function deleteServiceById(id: string) {
  const db = await getMongoDb();
  return db.collection("services").deleteOne({ _id: new ObjectId(id) });
}

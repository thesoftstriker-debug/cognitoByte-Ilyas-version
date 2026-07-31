import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export async function createUser(user: Omit<UserDoc, "_id" | "createdAt" | "updatedAt">) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("users").insertOne({
    ...user,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findUserByEmail(email: string) {
  const db = await getMongoDb();
  return db.collection("users").findOne({ email });
}

export async function findUserById(id: string) {
  const db = await getMongoDb();
  return db.collection("users").findOne({ _id: new ObjectId(id) });
}

export async function findAllUsers(
  search?: string,
  page = 1,
  limit = 10
) {
  const db = await getMongoDb();
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const total = await db.collection("users").countDocuments(query);
  const users = await db
    .collection("users")
    .find(query)
    .project({ password: 0 })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateUserRole(id: string, role: "user" | "admin") {
  const db = await getMongoDb();
  return db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: { role, updatedAt: new Date() } }
  );
}

export async function deleteUserById(id: string) {
  const db = await getMongoDb();
  return db.collection("users").deleteOne({ _id: new ObjectId(id) });
}

import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface OrderItemDoc {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  imageUrl?: string;
  fileUrl?: string;
}

export type OrderStatus = "pending" | "delivered";

export interface OrderDoc {
  _id?: ObjectId;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItemDoc[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export async function createOrder(
  order: Omit<OrderDoc, "_id" | "createdAt" | "updatedAt">
) {
  const db = await getMongoDb();
  const now = new Date();
  const result = await db.collection("orders").insertOne({
    ...order,
    createdAt: now,
    updatedAt: now,
  });
  return result;
}

export async function findOrdersByUser(userId: string) {
  const db = await getMongoDb();
  return db
    .collection("orders")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findAllOrders(page = 1, limit = 10) {
  const db = await getMongoDb();
  const total = await db.collection("orders").countDocuments({});
  const orders = await db
    .collection("orders")
    .find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const db = await getMongoDb();
  return db.collection("orders").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );
}

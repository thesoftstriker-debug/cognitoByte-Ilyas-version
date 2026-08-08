import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface WishlistItemDoc {
  _id?: ObjectId;
  userId: string;
  productId: string;
  createdAt: Date;
}

export async function getUserWishlist(userId: string) {
  const db = await getMongoDb();
  const wishItems = await db.collection("wishlists").find({ userId }).sort({ createdAt: -1 }).toArray();
  const productIds = wishItems.map((item) => {
    try { return new ObjectId(item.productId); } catch { return null; }
  }).filter(Boolean) as unknown as ObjectId[];

  if (productIds.length === 0) return [];
  return await db.collection("products").find({ _id: { $in: productIds } }).toArray();
}

export async function addToWishlist(userId: string, productId: string) {
  const db = await getMongoDb();
  const existing = await db.collection("wishlists").findOne({ userId, productId });
  if (existing) return existing;
  return await db.collection("wishlists").insertOne({
    userId,
    productId,
    createdAt: new Date(),
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const db = await getMongoDb();
  return await db.collection("wishlists").deleteOne({ userId, productId });
}

export async function checkInWishlist(userId: string, productId: string): Promise<boolean> {
  const db = await getMongoDb();
  const found = await db.collection("wishlists").findOne({ userId, productId });
  return !!found;
}

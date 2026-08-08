import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface ReviewDoc {
  _id?: ObjectId;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

export async function getReviewsByProduct(productId: string) {
  const db = await getMongoDb();
  return await db.collection("reviews").find({ productId }).sort({ createdAt: -1 }).toArray();
}

export async function createReview(review: Omit<ReviewDoc, "_id" | "createdAt">) {
  const db = await getMongoDb();
  return await db.collection("reviews").insertOne({
    ...review,
    createdAt: new Date(),
  });
}

export async function getAverageRating(productId: string): Promise<{ rating: number; count: number }> {
  const db = await getMongoDb();
  const reviews = await db.collection("reviews").find({ productId }).toArray();
  if (reviews.length === 0) return { rating: 5, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  return {
    rating: Number((sum / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}

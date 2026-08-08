import { ObjectId } from "mongodb";
import { getMongoDb } from "../mongodb";

export interface CouponDoc {
  _id?: ObjectId;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g. 20 for 20% or $20
  minOrderAmount?: number;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createCoupon(coupon: Omit<CouponDoc, "_id" | "createdAt" | "updatedAt">) {
  const db = await getMongoDb();
  const now = new Date();
  return await db.collection("coupons").insertOne({
    ...coupon,
    code: coupon.code.toUpperCase().trim(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function findAllCoupons() {
  const db = await getMongoDb();
  return await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray();
}

export async function findCouponByCode(code: string): Promise<CouponDoc | null> {
  const db = await getMongoDb();
  const found = await db.collection("coupons").findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  });
  return found as CouponDoc | null;
}

export async function deleteCoupon(id: string) {
  const db = await getMongoDb();
  return await db.collection("coupons").deleteOne({ _id: new ObjectId(id) });
}

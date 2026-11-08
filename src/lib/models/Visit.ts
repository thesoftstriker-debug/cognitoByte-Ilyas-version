import { getMongoDb } from "../mongodb";

const COLLECTION = "visit_counts";
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

function pakistanDayKey(date = new Date()): string {
  const shifted = new Date(date.getTime() + PKT_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

function lastDayKeys(days: number): string[] {
  const shiftedNow = Date.now() + PKT_OFFSET_MS;
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(new Date(shiftedNow - i * 86400000).toISOString().slice(0, 10));
  }
  return keys;
}

export interface VisitStats {
  totalToday: number;
  totalAllTime: number;
  daily: { date: string; count: number }[];
}

interface VisitCountDoc {
  _id: string;
  count: number;
  updatedAt?: Date;
}

export async function trackVisit(): Promise<void> {
  const db = await getMongoDb();
  const day = pakistanDayKey();
  await db.collection<VisitCountDoc>(COLLECTION).updateOne(
    { _id: day },
    { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getTodayVisits(): Promise<{ totalToday: number }> {
  const db = await getMongoDb();
  const doc = await db
    .collection<VisitCountDoc>(COLLECTION)
    .findOne({ _id: pakistanDayKey() });
  return { totalToday: typeof doc?.count === "number" ? doc.count : 0 };
}

export async function getVisitStats(days = 7): Promise<VisitStats> {
  const db = await getMongoDb();
  const collection = db.collection<VisitCountDoc>(COLLECTION);
  const keys = lastDayKeys(days);

  const [sumAgg, docs] = await Promise.all([
    collection
      .aggregate([{ $group: { _id: null, total: { $sum: "$count" } } }])
      .toArray(),
    collection.find({ _id: { $in: keys } }).toArray(),
  ]);

  const counts = new Map(
    docs.map((doc) => [doc._id, Number(doc.count) || 0])
  );
  const daily = keys.map((date) => ({ date, count: counts.get(date) || 0 }));

  return {
    totalToday: counts.get(pakistanDayKey()) || 0,
    totalAllTime: Number(sumAgg[0]?.total) || 0,
    daily,
  };
}

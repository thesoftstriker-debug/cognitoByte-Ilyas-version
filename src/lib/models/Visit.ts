import { getMongoDb } from "../mongodb";

export interface VisitDoc {
  path: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
}

export async function trackVisit(visit: VisitDoc) {
  const db = await getMongoDb();
  return db.collection("visits").insertOne(visit);
}

export interface VisitStats {
  totalToday: number;
  uniqueToday: number;
  totalAllTime: number;
  uniqueAllTime: number;
  daily: { date: string; count: number; unique: number }[];
  topPages: { path: string; count: number }[];
}

export async function getVisitStats(days = 7): Promise<VisitStats> {
  const db = await getMongoDb();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalToday, uniqueToday, totalAllTime, uniqueAllTime] =
    await Promise.all([
      db.collection("visits").countDocuments({ createdAt: { $gte: startOfToday } }),
      db
        .collection("visits")
        .distinct("ip", { createdAt: { $gte: startOfToday } })
        .then((ips) => ips.length),
      db.collection("visits").countDocuments({}),
      db.collection("visits").distinct("ip").then((ips) => ips.length),
    ]);

  const startOfRange = new Date(startOfToday);
  startOfRange.setDate(startOfRange.getDate() - (days - 1));

  const dailyAgg = await db
    .collection("visits")
    .aggregate([
      { $match: { createdAt: { $gte: startOfRange } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          ips: { $addToSet: "$ip" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  const dailyMap = new Map(
    dailyAgg.map((d: any) => [d._id, { date: d._id, count: d.count, unique: d.ips.length }])
  );
  const daily: { date: string; count: number; unique: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startOfRange);
    date.setDate(startOfRange.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const existing = dailyMap.get(key);
    daily.push(existing || { date: key, count: 0, unique: 0 });
  }

  const topPages = await db
    .collection("visits")
    .aggregate([
      { $match: { createdAt: { $gte: startOfRange } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  return {
    totalToday,
    uniqueToday,
    totalAllTime,
    uniqueAllTime,
    daily,
    topPages: topPages.map((p: any) => ({ path: p._id, count: p.count })),
  };
}

export async function findVisits(
  {
    search,
    page = 1,
    limit = 20,
  }: { search?: string; page?: number; limit?: number } = {}
) {
  const db = await getMongoDb();
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { ip: { $regex: search, $options: "i" } },
      { path: { $regex: search, $options: "i" } },
      { userAgent: { $regex: search, $options: "i" } },
    ];
  }
  const total = await db.collection("visits").countDocuments(query);
  const visits = await db
    .collection("visits")
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return { visits, total, page, totalPages: Math.ceil(total / limit) };
}
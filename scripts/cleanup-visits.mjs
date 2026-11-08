import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

function loadEnv() {
  const envPath = new URL("../.env", import.meta.url);
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

loadEnv();

const uri = process.env.MONGODB_URL;
if (!uri) {
  console.error("MONGODB_URL is missing in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("CognitoByte");

  const hasRawVisits = await db.listCollections({ name: "visits" }).hasNext();
  if (!hasRawVisits) {
    console.log("No raw 'visits' collection found — nothing to clean.");
  } else {
    const daily = await db
      .collection("visits")
      .aggregate([
        { $match: { createdAt: { $type: "date" } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Karachi",
              },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    for (const day of daily) {
      await db.collection("visit_counts").updateOne(
        { _id: day._id },
        { $inc: { count: day.count }, $set: { updatedAt: new Date() } },
        { upsert: true }
      );
    }

    await db.collection("visits").drop();
    console.log(
      `Migrated ${daily.length} day(s) into 'visit_counts' and deleted raw 'visits' data.`
    );
  }
} catch (error) {
  console.error("Cleanup failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}

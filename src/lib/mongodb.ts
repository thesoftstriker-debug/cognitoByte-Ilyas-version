import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URL || "";
const options = { serverSelectionTimeoutMS: 5000 };

// Cache connection on the global object so it survives
// Next.js hot reloads in dev and is reused across serverless invocations.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoDb: Db | undefined;
}

export async function getMongoDb(): Promise<Db> {
  // Validate cached client is still connected, otherwise drop it so we reconnect.
  if (global._mongoClient) {
    try {
      await global._mongoClient.db("CognitoByte").command({ ping: 1 });
    } catch {
      global._mongoClient = undefined;
      global._mongoDb = undefined;
    }
  }

  if (!uri) throw new Error("Missing MONGODB_URL environment variable");

  // Reuse existing client or create a new one
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
    await global._mongoClient.connect();
  }

  global._mongoDb = global._mongoClient.db("CognitoByte");
  return global._mongoDb;
}

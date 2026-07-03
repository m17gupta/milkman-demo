import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "milkman";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI. Add it to your local environment.");
}

const cache = global.mongooseCache || { conn: null, promise: null };

export async function connectToDatabase() {
  const connectionUri = MONGODB_URI;

  if (!connectionUri) {
    throw new Error("Missing MONGODB_URI. Add it to your local environment.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(connectionUri, {
      dbName: MONGODB_DB_NAME,
    });
  }

  cache.conn = await cache.promise;
  global.mongooseCache = cache;

  return cache.conn;
}

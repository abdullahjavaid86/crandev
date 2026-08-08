import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB stores submitted data only — contact queries, meeting requests, job
 * applications. It never serves page content; that comes from JSON (§7).
 *
 * `server-only` above is load-bearing: importing this into a client component
 * would ship the driver and the connection string to the browser. With it,
 * that becomes a build error instead.
 */

let clientPromise: Promise<MongoClient> | undefined;

function uri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    // Fail here with a sentence, not deep inside the driver with `undefined`.
    throw new Error("MONGODB_URI is not set — copy .env.example to .env.local");
  }
  return value;
}

/**
 * One cached connection promise, reused across invocations. Opening a client
 * per request exhausts the pool the first time traffic arrives.
 */
export function getClient(): Promise<MongoClient> {
  clientPromise ??= new MongoClient(uri()).connect();
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB ?? "cranedev");
}

/** The only collections that exist. All write-only — nothing reads them back. */
export const collections = {
  contact: "contact",
  meetings: "meetings",
  applications: "applications",
} as const;

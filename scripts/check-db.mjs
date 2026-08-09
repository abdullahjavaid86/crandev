/**
 * `yarn db:check` — is MONGODB_URI actually usable?
 *
 * Exists because a misconfigured database is invisible from the UI: the
 * contact action catches every failure and returns one deliberately vague
 * sentence, so "nothing arrived in the database" and "the URI is wrong" look
 * identical from the browser. This tells them apart in one command.
 */
import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "node:fs";

// Load .env.local by hand — this runs outside Next, so nothing else does it.
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "cranedev";

if (!uri) {
  console.error("✗ MONGODB_URI is not set.");
  console.error("  Local:  add it to .env.local (see .env.example)");
  console.error(
    "  Vercel: Project → Settings → Environment Variables, then `vercel env pull`",
  );
  process.exit(1);
}

try {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(dbName);
  await db.command({ ping: 1 });
  const counts = {};
  for (const name of ["contact", "meetings", "applications"]) {
    counts[name] = await db.collection(name).countDocuments({}, { limit: 1000 });
  }
  console.log(`✓ connected to "${dbName}"`);
  console.log("  documents:", counts);
  await client.close();
} catch (err) {
  console.error("✗ could not connect:", err.message);
  console.error("  Common causes: IP not allow-listed in Atlas, wrong password,");
  console.error("  or the database name in the URI path overriding MONGODB_DB.");
  process.exit(1);
}

/**
 * `yarn admin:reset-2fa <email>` — recover an admin who lost their authenticator.
 *
 * Clears the TOTP secret, the enabled flag and the backup codes, and deletes
 * every session for that admin. The session delete is not optional: a 2FA reset
 * that leaves live sessions open has not secured anything, because whoever is
 * holding a stolen cookie keeps their access.
 *
 * This runs under plain `node`, outside Next's bundler, so it cannot import
 * `lib/admin/*` — those modules use `server-only` and the `@/` path alias, and
 * node resolves neither. `lib/admin/types.ts` is the source of truth for the
 * document shape touched below.
 */
import { readFileSync, existsSync } from "node:fs";
import { MongoClient } from "mongodb";

// Load .env.local by hand — this runs outside Next, so nothing else does it.
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();

if (!email) {
  console.error("✗ no email given.");
  console.error("  Usage: yarn admin:reset-2fa <email>");
  process.exit(1);
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

let client;
try {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
} catch (err) {
  console.error("✗ could not connect:", err.message);
  console.error("  Common causes: IP not allow-listed in Atlas, wrong password,");
  console.error("  or the database name in the URI path overriding MONGODB_DB.");
  process.exit(1);
}

try {
  const db = client.db(dbName);
  const admin = await db
    .collection("admins")
    .findOne({ email }, { projection: { _id: 1, name: 1, totpEnabled: 1 } });

  if (!admin) {
    console.error(`✗ no admin with ${email} in "${dbName}".`);
    console.error("  Check the spelling, or `yarn admin:seed` to create the account.");
    await client.close();
    process.exit(1);
  }

  await db.collection("admins").updateOne(
    { _id: admin._id },
    {
      // totpSecret is unset rather than emptied — an empty string is still a
      // value someone could later mistake for a secret.
      $unset: { totpSecret: "" },
      $set: { totpEnabled: false, backupCodes: [], updatedAt: new Date() },
    },
  );

  const { deletedCount } = await db
    .collection("sessions")
    .deleteMany({ adminId: admin._id });

  console.log(`✓ 2FA reset for ${email}`);
  console.log("  name:            ", admin.name);
  console.log("  was enabled:     ", admin.totpEnabled === true);
  console.log("  TOTP secret:      cleared");
  console.log("  backup codes:     cleared");
  console.log(`  sessions revoked: ${deletedCount}`);
  console.log("  They can sign in with their password and re-enrol at /admin/account.");
  await client.close();
} catch (err) {
  console.error("✗ reset failed:", err.message);
  await client.close();
  process.exit(1);
}

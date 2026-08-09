/**
 * `yarn admin:seed` — create the first admin account.
 *
 * The seeder is the ONLY way an admin is created in v1 (there is no admin
 * management screen), so it has to be safe to run twice: it refuses to touch an
 * email that already exists rather than quietly resetting somebody's password.
 *
 * This runs under plain `node`, outside Next's bundler, so it cannot import
 * `lib/admin/*` — those modules use `server-only` and the `@/` path alias, and
 * node resolves neither. The document shape and the bcrypt work factor below
 * are therefore duplicated on purpose. `lib/admin/types.ts` is the source of
 * truth for the shape and `lib/admin/passwords.ts` for the work factor; if
 * either changes, change it here too.
 */
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { readFileSync, existsSync } from "node:fs";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

/** Must match WORK_FACTOR in lib/admin/passwords.ts. */
const WORK_FACTOR = 12;
const MIN_PASSWORD_LENGTH = 12;

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

/** Prompt on a TTY. `hidden` mutes the echo so a password never lands in the
 *  terminal scrollback or a screen recording. */
function ask(question, { hidden = false } = {}) {
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    let answered = false;
    rl.question(question, (answer) => {
      answered = true;
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    // Ctrl-D or a closed pipe would otherwise hang on an unsettled promise.
    rl.on("close", () => {
      if (answered) return;
      process.stdout.write("\n");
      console.error("✗ input ended before the question was answered.");
      process.exit(1);
    });
    muted = hidden;
  });
}

/** Env first so CI and one-liners work without a TTY; prompt only as fallback. */
async function value(envVar, question, { hidden = false } = {}) {
  const fromEnv = process.env[envVar];
  if (fromEnv && fromEnv.trim()) return hidden ? fromEnv : fromEnv.trim();
  if (!process.stdin.isTTY) {
    console.error(`✗ ${envVar} is not set and there is no terminal to prompt on.`);
    console.error(
      "  Run with env vars: ADMIN_EMAIL=… ADMIN_NAME=… ADMIN_PASSWORD=… yarn admin:seed",
    );
    process.exit(1);
  }
  return ask(question, { hidden });
}

const email = (await value("ADMIN_EMAIL", "Email: ")).toLowerCase().trim();
const name = await value("ADMIN_NAME", "Name: ");
const password = await value("ADMIN_PASSWORD", "Password (never echoed): ", {
  hidden: true,
});

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`✗ "${email}" is not a valid email address.`);
  process.exit(1);
}
if (!name) {
  console.error("✗ Name is required.");
  process.exit(1);
}
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`✗ Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

// Confirm only when it was typed blind — an env var can be re-read, a hidden
// prompt cannot.
if (!process.env.ADMIN_PASSWORD && process.stdin.isTTY) {
  const again = await ask("Confirm password: ", { hidden: true });
  if (again !== password) {
    console.error("✗ Passwords do not match.");
    process.exit(1);
  }
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

const db = client.db(dbName);

/**
 * Same indexes as ensureAdminIndexes() in lib/admin/collections.ts. Idempotent.
 * The unique index on admins.email is created BEFORE the insert, so it is the
 * thing that makes "refuses to overwrite" true even under a race.
 */
async function ensureIndexes() {
  await db.collection("admins").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true });
  await db
    .collection("sessions")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("sessions").createIndex({ adminId: 1 });
  await db
    .collection("notes")
    .createIndex({ subjectType: 1, subjectId: 1, createdAt: -1 });
  await db.collection("login_attempts").createIndex({ address: 1, createdAt: -1 });
  await db
    .collection("login_attempts")
    .createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
}

try {
  await ensureIndexes();

  const admins = db.collection("admins");
  const existing = await admins.findOne({ email }, { projection: { _id: 1 } });
  if (existing) {
    console.error(`✗ an admin with ${email} already exists — refusing to overwrite.`);
    console.error("  Seeding never resets a password. To recover an account:");
    console.error("    • change the password from /admin/account while signed in, or");
    console.error("    • `yarn admin:reset-2fa <email>` if the second factor is lost.");
    await client.close();
    process.exit(1);
  }

  const now = new Date();
  // Shape mirrors AdminDoc in lib/admin/types.ts.
  const doc = {
    email,
    name,
    password: await bcrypt.hash(password, WORK_FACTOR),
    active: true,
    totpEnabled: false,
    backupCodes: [],
    createdAt: now,
    updatedAt: now,
  };

  const { insertedId } = await admins.insertOne(doc);

  console.log(`✓ admin created in "${dbName}"`);
  console.log("  id:      ", insertedId.toHexString());
  console.log("  email:   ", email);
  console.log("  name:    ", name);
  console.log("  active:  ", true);
  console.log("  2FA:      not enabled — turn it on from /admin/account");
  console.log("  indexes:  ensured (admins, sessions, notes, login_attempts)");
  console.log("  The password is not printed. Sign in at /admin/login.");
  await client.close();
} catch (err) {
  // Belt and braces: if two seeds race, the unique index rejects the loser.
  if (err.code === 11000) {
    console.error(`✗ an admin with ${email} already exists — refusing to overwrite.`);
  } else {
    console.error("✗ seeding failed:", err.message);
  }
  await client.close();
  process.exit(1);
}

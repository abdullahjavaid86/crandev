import "server-only";
import bcrypt from "bcryptjs";

/**
 * Password and recovery-code hashing.
 *
 * bcryptjs rather than native bcrypt: pure JS, so there is no build step and
 * nothing to fail on a serverless image.
 */
const WORK_FACTOR = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, WORK_FACTOR);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Ten single-use recovery codes. Returned in plain text ONCE for display, and
 * stored only as hashes — the same rule as passwords, because a leaked backup
 * code is a bypass of the second factor.
 */
export async function generateBackupCodes(
  count = 10,
): Promise<{ plain: string[]; hashed: string[] }> {
  const { randomBytes } = await import("node:crypto");
  const plain = Array.from({ length: count }, () =>
    // Grouped for legibility when someone writes these down.
    randomBytes(5)
      .toString("hex")
      .match(/.{1,5}/g)!
      .join("-"),
  );
  const hashed = await Promise.all(plain.map((code) => bcrypt.hash(code, WORK_FACTOR)));
  return { plain, hashed };
}

/**
 * Checks a code against the stored hashes and reports which one matched, so the
 * caller can burn it. Returns -1 for no match.
 */
export async function matchBackupCode(code: string, hashes: string[]): Promise<number> {
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(code, hashes[i])) return i;
  }
  return -1;
}

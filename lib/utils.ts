type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Joins Tailwind class names, dropping falsy values so conditionals read
 * inline: cn('px-4', isActive && 'text-cyan').
 *
 * Deliberately dependency-free (CLAUDE.md §10). Note it does NOT resolve
 * conflicting utilities — `cn('px-4', 'px-6')` yields both, and the last
 * one in the stylesheet wins rather than the last one passed. Build variant
 * maps so their classes don't overlap. If a real conflict shows up once
 * primitives land, that is the moment to justify `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }

  return out.join(" ");
}

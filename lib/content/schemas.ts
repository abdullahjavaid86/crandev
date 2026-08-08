import { z } from "zod";

/**
 * Schemas are the single definition of every content shape. Types derive via
 * z.infer — never hand-write an interface next to one of these, they drift.
 *
 * These are deliberately strict. Content failing validation should break the
 * build, where it is cheap, rather than a page nobody opened (§7.0).
 */

/** kebab-case, stable, never changes after publish — it's the route key. */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");

/**
 * §8: "a real number beats an adjective every time." An outcome line without
 * a digit in it is an adjective wearing a number's clothes, so the schema
 * refuses it rather than leaving it to review.
 */
const measured = z
  .string()
  .min(1)
  .regex(/\d/, "must contain a real number — see CLAUDE.md §8");

export const ProjectSchema = z.object({
  slug,
  client: z.string().min(1),
  /** One line: the measurable result. Shown on the card. */
  outcome: measured,
  /** problem → what we built → outcome, one sentence each. */
  problem: z.string().min(1),
  built: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  year: z.number().int().min(2015).max(2100),
  /** Duration in weeks — mono metadata on the detail view. */
  weeks: z.number().int().positive().optional(),
});

export const TeamMemberSchema = z.object({
  slug,
  name: z.string().min(1),
  role: z.string().min(1),
  /** One line of substance — what they've shipped, not adjectives. */
  bio: z.string().min(1),
  stack: z.array(z.string().min(1)).default([]),
});

export const TestimonialSchema = z.object({
  quote: z.string().min(1),
  /** Attribution is mandatory. An unattributed quote reads as fabricated. */
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
});

export const BrandSchema = z.object({
  name: z.string().min(1),
  /** Path under /public. SVG strongly preferred — never an upscaled raster. */
  logo: z.string().startsWith("/"),
});

export const RoleSchema = z.object({
  slug,
  title: z.string().min(1),
  level: z.string().min(1),
  location: z.string().min(1),
  /** Stated, not withheld. Withholding costs more senior applicants than it saves. */
  band: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
});

export type Project = z.infer<typeof ProjectSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Role = z.infer<typeof RoleSchema>;

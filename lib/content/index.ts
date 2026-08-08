import rawWork from "@/content/work.json";
import rawTeam from "@/content/team.json";
import rawTestimonials from "@/content/testimonials.json";
import rawBrands from "@/content/brands.json";
import rawRoles from "@/content/roles.json";
import rawStats from "@/content/stats.json";
import rawServices from "@/content/services.json";
import rawProcess from "@/content/process.json";

import {
  BrandSchema,
  ProcessStepSchema,
  ServiceSchema,
  StatSchema,
  ProjectSchema,
  RoleSchema,
  TeamMemberSchema,
  TestimonialSchema,
} from "./schemas";
import type { Brand, ProcessStep, Project, Role, Service, Stat, TeamMember, Testimonial } from "./schemas";

export type { Brand, ProcessStep, Project, Role, Service, Stat, TeamMember, Testimonial };

/**
 * Parse at the module boundary, once. Everything downstream consumes the
 * parsed value, so nothing in the app ever touches untyped JSON.
 *
 * `parse`, not `safeParse` — malformed content is a build failure, not a
 * runtime state to design for. The thrown error names the offending field.
 */
function load<T>(schema: { parse: (v: unknown) => T[] }, raw: unknown, name: string): T[] {
  try {
    return schema.parse(raw);
  } catch (err) {
    throw new Error(
      `content/${name}.json failed validation — see lib/content/schemas.ts\n${String(err)}`,
    );
  }
}

export const projects = load(ProjectSchema.array(), rawWork, "work");
export const team = load(TeamMemberSchema.array(), rawTeam, "team");
export const testimonials = load(TestimonialSchema.array(), rawTestimonials, "testimonials");
export const brands = load(BrandSchema.array(), rawBrands, "brands");
export const roles = load(RoleSchema.array(), rawRoles, "roles");
export const stats = load(StatSchema.array(), rawStats, "stats");
export const services = load(ServiceSchema.array(), rawServices, "services");
export const process = load(ProcessStepSchema.array(), rawProcess, "process");

/** Slug lookups for dynamic routes. Return undefined so callers can notFound(). */
export const projectBySlug = (s: string): Project | undefined =>
  projects.find((p) => p.slug === s);

export const roleBySlug = (s: string): Role | undefined => roles.find((r) => r.slug === s);

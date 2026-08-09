/**
 * Budget bands, deliberately in their own module with no zod import.
 *
 * The form needs these as a VALUE to render the select. If it imported them
 * from the schema module it would pull zod into the client bundle — a
 * validation library shipped to every visitor so a dropdown can list five
 * strings. The schema imports this, not the other way round.
 */
export const BUDGET_BANDS = [
  "Under £25k",
  "£25k – £60k",
  "£60k – £150k",
  "Over £150k",
  "Not sure yet",
] as const;

/**
 * The honeypot input's name, defined once so the form and the action cannot
 * disagree — renaming it on one side only would disable the check in silence.
 *
 * Deliberately NOT `website`, `url`, `email`, `organization` or any other
 * token a browser's autofill or a password manager recognises. Those fill an
 * off-screen text input happily, and a honeypot that trips on real people is
 * worse than no honeypot at all: it used to answer "That is with us" and throw
 * the message away.
 *
 * Its own module, NOT `schema.ts`, for the reason `bands.ts` exists: every
 * value the client imports from the schema module drags zod into the browser
 * bundle with it. That shipped 276KB to visitors once. Types are erased and
 * are safe to import from there; constants are not.
 */
export const HONEYPOT_FIELD = "contact-hp";

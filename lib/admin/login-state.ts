/**
 * The login action's result shape. Its own module with no server imports, so
 * the client form can import the type without pulling bcrypt or the driver
 * anywhere near the browser bundle.
 */
export type LoginState =
  | { status: "idle" }
  /** Credentials accepted; this admin has 2FA on and owes a second factor. */
  | { status: "totp_required" }
  | { status: "error"; message: string };

export const LOGIN_INITIAL: LoginState = { status: "idle" };

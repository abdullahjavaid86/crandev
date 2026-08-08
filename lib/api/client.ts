import axios, { AxiosError } from "axios";

/**
 * The one axios instance. Nothing else creates one, and no component imports
 * axios directly — typed call sites live in lib/api/<domain>.ts and return
 * our own types, never a raw upstream shape (§7.1).
 */
export const api = axios.create({ timeout: 8000 });

export interface NormalizedError {
  status: number | null;
  message: string;
  /** Machine-readable handle for branching; never shown to a user. */
  code: string;
}

/**
 * Flattens every axios failure mode — HTTP status, timeout, DNS, abort — into
 * one shape, so call sites branch on a field instead of sniffing the error.
 *
 * The message here is for logs. User-facing copy comes from the section, in
 * the interface's voice (§7.4).
 */
export function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;

    if (e.response) {
      return {
        status: e.response.status,
        message: `Upstream responded ${e.response.status}`,
        code: e.response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR",
      };
    }

    if (e.code === "ECONNABORTED") {
      return { status: null, message: "Upstream timed out", code: "TIMEOUT" };
    }

    return {
      status: null,
      message: e.message || "Network request failed",
      code: "NETWORK",
    };
  }

  return {
    status: null,
    message: err instanceof Error ? err.message : "Unknown error",
    code: "UNKNOWN",
  };
}

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(normalizeError(err)),
);

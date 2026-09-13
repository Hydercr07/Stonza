import { captureRequestError } from "@sentry/nextjs";

/**
 * Server/edge-side error monitoring, gated behind SENTRY_DSN. Sentry's SDK
 * treats a missing `dsn` as "disabled" by design (documented behavior, not
 * a workaround here), so this file is a safe no-op until a DSN is set --
 * shipping it can't break a deployment that hasn't configured Sentry yet,
 * same pattern as DATA_BACKEND and RESEND_API_KEY elsewhere in this app.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = captureRequestError;

import * as Sentry from "@sentry/nextjs";

// No dsn set (SENTRY_DSN unset) => Sentry's SDK is a documented no-op.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  sendDefaultPii: false,
});

import * as Sentry from "@sentry/nextjs";

// No dsn set (NEXT_PUBLIC_SENTRY_DSN unset) => Sentry's SDK is a documented
// no-op, so this file is inert until a DSN is configured. Client-side needs
// its own NEXT_PUBLIC_-prefixed var since only those are available in the
// browser bundle.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  sendDefaultPii: false,
});

// Lets Sentry tag errors with which client-side navigation they happened
// during -- Sentry's own required hook for App Router route instrumentation.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

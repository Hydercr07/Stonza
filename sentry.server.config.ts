import * as Sentry from "@sentry/nextjs";

// No dsn set (SENTRY_DSN unset) => Sentry's SDK is a documented no-op: it
// won't send anything, and every call below stays cheap and inert.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  // Full request/response bodies can carry a customer's name, email,
  // address, and phone number from the checkout form -- keep them out of
  // error reports by default.
  sendDefaultPii: false,
});

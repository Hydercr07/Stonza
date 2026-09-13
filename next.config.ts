import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  // Reverting previous change: removed webpack externalization for jsdom
};

// Uploads source maps to Sentry so stack traces show real file/line numbers
// instead of minified output -- only actually runs when SENTRY_AUTH_TOKEN is
// set (an org-level token, separate from the DSN); otherwise this wrapper
// just skips the upload step and passes the build through unchanged, so it
// never breaks a build that hasn't configured Sentry.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  telemetry: false,
});

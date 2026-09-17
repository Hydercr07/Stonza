"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* Next's default error UI is fine here -- this boundary only fires
            for errors severe enough to crash the root layout itself, a rare
            path not worth a bespoke design. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";

// Route-segment error boundary for the whole authenticated admin portal.
// Before this existed, ANY uncaught error thrown by a Server Action wired
// to a bare <form action={...}> -- a validation failure, an invalid status
// transition, a missing required field -- propagated all the way to the
// root src/app/global-error.tsx, which replaces the entire page (sidebar,
// nav, everything) with Next's generic "Application error" blank screen.
// This catches it at the portal boundary instead: the sidebar and layout
// chrome stay intact, and the admin gets a recoverable message with a
// retry button instead of having to reload the whole app. It does not fix
// the underlying validation gaps (several of those are fixed separately),
// but it caps the worst-case failure mode for every one of them, present
// and future, in one place.
export default function AdminPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#e7dfd1] bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[#171717]">
          That action couldn&apos;t be completed
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6f6558]">
          {error.message || "An unexpected error occurred. Nothing else on this page was affected."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

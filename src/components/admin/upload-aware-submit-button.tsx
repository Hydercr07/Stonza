"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/shared/ui/button";

function hasPendingUploads(form: HTMLFormElement | null) {
  return Boolean(form?.querySelector('[data-admin-uploading="true"]'));
}

export function UploadAwareSubmitButton({
  children,
  waitingLabel = "Finishing uploads...",
  ...props
}: ButtonProps & {
  waitingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const [waitingForUploads, setWaitingForUploads] = useState(false);
  const pendingFormRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!waitingForUploads) return;

    const interval = window.setInterval(() => {
      if (!hasPendingUploads(pendingFormRef.current)) {
        window.clearInterval(interval);
        setWaitingForUploads(false);
        pendingFormRef.current?.requestSubmit();
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [waitingForUploads]);

  return (
    <Button
      type="submit"
      {...props}
      disabled={pending || waitingForUploads || props.disabled}
      onClick={(event) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;

        const form = event.currentTarget.form;
        if (hasPendingUploads(form)) {
          event.preventDefault();
          pendingFormRef.current = form;
          setWaitingForUploads(true);
        }
      }}
    >
      {pending || waitingForUploads ? waitingLabel : children}
    </Button>
  );
}

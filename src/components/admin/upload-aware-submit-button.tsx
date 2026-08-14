"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/shared/ui/button";

export function UploadAwareSubmitButton({
  children,
  waitingLabel = "Saving...",
  ...props
}: ButtonProps & {
  waitingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" {...props} disabled={pending || props.disabled}>
      {pending ? waitingLabel : children}
    </Button>
  );
}

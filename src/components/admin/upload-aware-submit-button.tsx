"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/shared/ui/button";
import { useUploadStatus } from "@/components/admin/upload-status-context";

export function UploadAwareSubmitButton({
  children,
  waitingLabel = "Saving...",
  ...props
}: ButtonProps & {
  waitingLabel?: string;
}) {
  const { pending } = useFormStatus();
  // Previously only checked the server action's own pending state -- not
  // whether an AdminMediaUploader elsewhere in the same form was still
  // mid-upload, so clicking Save while an image was uploading submitted the
  // form with the in-flight image silently missing from the saved media list.
  const { uploading } = useUploadStatus();

  return (
    <Button type="submit" {...props} disabled={pending || uploading || props.disabled}>
      {pending ? waitingLabel : uploading ? "Uploading..." : children}
    </Button>
  );
}

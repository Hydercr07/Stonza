"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { FileVideo, Loader2, Upload } from "lucide-react";
import { validateMediaInput } from "@/lib/media";
import { cn } from "@/lib/utils";

type UploadAssetResponse = {
  id: string;
  publicUrl: string;
  originalFilename: string;
  size: number;
  mimeType?: string;
};

function previewableImage(url: string) {
  return /\.(png|jpe?g|webp|avif|svg)$/i.test(url);
}

export function MediaUrlField({
  name,
  label,
  description,
  defaultValue = "",
  accept,
  imageOnly = false,
  onValueChange,
}: {
  name: string;
  label: string;
  description: string;
  defaultValue?: string;
  accept: string;
  imageOnly?: boolean;
  onValueChange?: (nextValue: string) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    const validationError = validateMediaInput({
      mimeType: file.type,
      size: file.size,
      imageOnly,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const asset = await new Promise<UploadAssetResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload");
        xhr.responseType = "json";
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response as UploadAssetResponse);
            return;
          }
          reject(new Error((xhr.response as { error?: string })?.error || "Upload failed."));
        };
        xhr.onerror = () => reject(new Error("Upload failed."));
        const form = new FormData();
        form.append("file", file);
        xhr.send(form);
      });

      setValue(asset.publicUrl);
      onValueChange?.(asset.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm leading-6 text-white/55">{description}</p>
      </div>
      {value ? (
        <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0d0e0f]">
          {previewableImage(value) ? (
            <div className="relative aspect-[16/9]">
              <Image src={value} alt={label} fill loading="eager" sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          ) : (
            <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-white/60">
              <FileVideo className="h-5 w-5" />
              {value}
            </div>
          )}
        </div>
      ) : null}
      <input
        name={name}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChange?.(event.target.value);
        }}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
        placeholder="/uploads/images/..."
      />
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/6",
            uploading && "cursor-wait opacity-80",
          )}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Browse Files
        </button>
        <span className="text-xs text-white/45">Drag and drop is available on the gallery-style uploader.</span>
      </div>
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
      {value ? <p className="text-xs text-white/45">Stored path: {value}</p> : null}
    </div>
  );
}

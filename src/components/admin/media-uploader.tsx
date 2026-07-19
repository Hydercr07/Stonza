"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Loader2, Star, Trash2, Upload } from "lucide-react";
import { humanFileSize, validateMediaInput } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ProductMediaItem } from "@/types/domain";

type UploadAssetResponse = {
  id: string;
  publicUrl: string;
  originalFilename: string;
  size: number;
  altText?: string;
};

function previewableImage(url: string) {
  return /\.(png|jpe?g|webp|avif|svg)$/i.test(url);
}

function reorderItems(items: ProductMediaItem[], fromId: string, toId: string) {
  const next = [...items];
  const fromIndex = next.findIndex((item) => item.id === fromId);
  const toIndex = next.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function normalizeFeatured(items: ProductMediaItem[]) {
  const featured = items.find((item) => item.featured) ?? items[0];
  return items.map((item, index) => ({
    ...item,
    featured: item.id === featured?.id,
    sortOrder: index + 1,
  }));
}

export function AdminMediaUploader({
  name,
  label,
  description,
  initialItems = [],
  imageOnly = true,
  multiple = true,
}: {
  name: string;
  label: string;
  description: string;
  initialItems?: ProductMediaItem[];
  imageOnly?: boolean;
  multiple?: boolean;
}) {
  const inputId = useId();
  const [items, setItems] = useState<ProductMediaItem[]>(normalizeFeatured(initialItems));
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemId = useRef<string | null>(null);

  const accept = imageOnly
    ? ".jpg,.jpeg,.png,.webp,.avif"
    : ".jpg,.jpeg,.png,.webp,.avif,.mp4,.webm,.pdf,.glb,.gltf";

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;

    const seen = new Set(items.map((item) => `${item.fileName}:${item.size}`));
    const duplicates = files.find((file) => seen.has(`${file.name}:${file.size}`));
    if (duplicates) {
      setError(`"${duplicates.name}" was already added.`);
      return;
    }

    for (const file of files) {
      const validationError = validateMediaInput({
        mimeType: file.type,
        size: file.size,
        imageOnly,
      });

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      for (const file of files) {
        const uploaded = await new Promise<UploadAssetResponse>((resolve, reject) => {
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

          const payload = new FormData();
          payload.append("file", file);
          xhr.send(payload);
        });

        setItems((current) =>
          normalizeFeatured([
            ...current,
            {
              id: `product-media-${uploaded.id}`,
              assetId: uploaded.id,
              url: uploaded.publicUrl,
              altText: uploaded.altText || file.name.replace(/\.[^.]+$/, ""),
              fileName: uploaded.originalFilename,
              size: uploaded.size,
              featured: current.length === 0,
              sortOrder: current.length + 1,
            },
          ]),
        );
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-sm leading-6 text-white/58">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-white/12 px-4 py-2 text-sm text-white transition hover:border-white/24 hover:bg-white/6"
        >
          Browse Files
        </button>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) {
            void uploadFiles(event.target.files);
          }
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void uploadFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-44 w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 text-center transition",
          dragOver ? "border-[#d5c7a9] bg-[#1c1a16]" : "border-white/14 bg-black/20 hover:border-white/28",
        )}
      >
        {uploading ? <Loader2 className="mb-4 h-7 w-7 animate-spin text-accent" /> : <Upload className="mb-4 h-7 w-7 text-accent" />}
        <p className="text-base font-medium text-white">Drag and drop files here</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
          Or use Browse Files.
        </p>
      </button>

      {error ? <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => {
                dragItemId.current = item.id;
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!dragItemId.current || dragItemId.current === item.id) return;
                setItems((current) => normalizeFeatured(reorderItems(current, dragItemId.current!, item.id)));
              }}
              className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151617]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0e0f]">
                {previewableImage(item.url) ? (
                  <Image src={item.url} alt={item.altText} fill loading="eager" sizes="(min-width: 1280px) 20vw, (min-width: 768px) 40vw, 100vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-white/55">
                    {item.fileName}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      normalizeFeatured(current.map((entry) => ({ ...entry, featured: entry.id === item.id }))),
                    )
                  }
                  className={cn(
                    "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                    item.featured ? "bg-[#d5c7a9] text-black" : "bg-black/65 text-white",
                  )}
                >
                  <Star className="h-3.5 w-3.5" />
                  {item.featured ? "Featured" : "Set Featured"}
                </button>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate text-sm font-medium text-white">{item.fileName}</p>
                  <p className="text-xs text-white/50">{humanFileSize(item.size)}</p>
                </div>
                <label className="grid gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
                  Alt text
                  <input
                    value={item.altText}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === item.id ? { ...entry, altText: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = items.filter((entry) => entry.id !== item.id);
                      setItems(normalizeFeatured(next));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/6 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                  <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-2 text-xs text-white/50">
                    Drag to reorder
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

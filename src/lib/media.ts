const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "model/gltf-binary",
  "model/gltf+json",
]);

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024;

export function isAllowedMediaType(mimeType: string) {
  return allowedMimeTypes.has(mimeType);
}

export function isAllowedImageType(mimeType: string) {
  return imageMimeTypes.has(mimeType);
}

export function isAllowedMediaSize(bytes: number) {
  return bytes > 0 && bytes <= MAX_MEDIA_SIZE_BYTES;
}

export function safeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-");
}

export function humanFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateMediaInput(input: { mimeType: string; size: number; imageOnly?: boolean }) {
  if (input.imageOnly && !isAllowedImageType(input.mimeType)) {
    return "Only JPG, JPEG, PNG, WebP and AVIF images are supported here.";
  }

  if (!isAllowedMediaType(input.mimeType)) {
    return "Unsupported file type.";
  }

  if (!isAllowedMediaSize(input.size)) {
    return "File exceeds the 20 MB upload limit.";
  }

  return null;
}

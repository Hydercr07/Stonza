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

export function isAllowedMediaType(mimeType: string) {
  return allowedMimeTypes.has(mimeType);
}

export function isAllowedMediaSize(bytes: number) {
  return bytes > 0 && bytes <= 20 * 1024 * 1024;
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { addMediaAsset } from "@/lib/data/store";
import { parseAdminSessionCookie } from "@/lib/auth/session";
import type { MediaType } from "@/types/domain";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const mimeGroups: Record<string, { type: MediaType; dir: string }> = {
  "image/jpeg": { type: "image", dir: "images" },
  "image/png": { type: "image", dir: "images" },
  "image/webp": { type: "image", dir: "images" },
  "image/avif": { type: "image", dir: "images" },
  "video/mp4": { type: "video", dir: "videos" },
  "video/webm": { type: "video", dir: "videos" },
  "application/pdf": { type: "document", dir: "documents" },
  "model/gltf-binary": { type: "model", dir: "models" },
  "model/gltf+json": { type: "model", dir: "models" },
};

function safeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("stonza-admin-session="))
    ?.slice("stonza-admin-session=".length);
  const session = parseAdminSessionCookie(sessionCookie ? decodeURIComponent(sessionCookie) : undefined);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const mime = mimeGroups[file.type];
  if (!mime) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeFilename(file.name)}`;
  const outputDir = path.join(process.cwd(), "public", "uploads", mime.dir);
  const absolutePath = path.join(outputDir, filename);
  const publicUrl = `/uploads/${mime.dir}/${filename}`;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(absolutePath, bytes);

  await addMediaAsset({
    id: `media-${crypto.randomUUID()}`,
    type: mime.type,
    path: absolutePath,
    publicUrl,
    originalFilename: file.name,
    mimeType: file.type,
    size: file.size,
    altText: "",
    caption: "",
    uploadedBy: session.email,
    uploadedAt: new Date().toISOString(),
    usage: [],
  });

  return NextResponse.redirect(new URL("/admin/media", request.url), { status: 303 });
}

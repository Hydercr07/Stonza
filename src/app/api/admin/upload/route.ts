import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { addMediaAsset } from "@/lib/data/store";
import { parseAdminSessionCookie } from "@/lib/auth/session";
import { safeFilename, validateMediaInput } from "@/lib/media";
import type { MediaAsset, MediaType } from "@/types/domain";

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

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function saveFile(file: File, sessionEmail: string): Promise<MediaAsset> {
  const validationError = validateMediaInput({
    mimeType: file.type,
    size: file.size,
  });
  if (validationError) {
    throw new Error(validationError);
  }

  const mime = mimeGroups[file.type];
  if (!mime) {
    throw new Error("Unsupported file type");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeFilename(file.name)}`;
  const outputDir = path.join(process.cwd(), "public", "uploads", mime.dir);
  const absolutePath = path.join(outputDir, filename);
  const publicUrl = `/uploads/${mime.dir}/${filename}`;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(absolutePath, bytes);

  const asset: MediaAsset = {
    id: `media-${crypto.randomUUID()}`,
    type: mime.type,
    path: absolutePath,
    publicUrl,
    originalFilename: file.name,
    mimeType: file.type,
    size: file.size,
    altText: file.name.replace(/\.[^.]+$/, ""),
    caption: "",
    uploadedBy: sessionEmail,
    uploadedAt: new Date().toISOString(),
    usage: [],
  };

  await addMediaAsset(asset);
  return asset;
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
    return unauthorized();
  }

  const formData = await request.formData();
  const entries = formData.getAll("file").filter((entry): entry is File => entry instanceof File);

  if (!entries.length) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const assets = [];
    for (const file of entries) {
      assets.push(await saveFile(file, session.email));
    }

    if ((request.headers.get("accept") ?? "").includes("application/json")) {
      return NextResponse.json(entries.length === 1 ? assets[0] : assets);
    }

    return NextResponse.redirect(new URL("/admin/media", request.url), { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const uploadRoot = path.join(process.cwd(), ".stonza", "uploads");

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const absolutePath = path.resolve(uploadRoot, ...segments);

  // A bare startsWith(uploadRoot) has no trailing separator, so a sibling
  // directory whose name merely starts with the same string (e.g.
  // ".stonza/uploads-backup") would satisfy the check via a "../" segment --
  // the classic CWE-22 prefix-check bypass. path.relative resolves that:
  // it's only safely inside uploadRoot if the relative path doesn't escape
  // upward and isn't itself an absolute path (a different drive on Windows).
  const relative = path.relative(uploadRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

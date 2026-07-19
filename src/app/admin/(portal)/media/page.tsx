import Image from "next/image";
import { listMediaAssets } from "@/lib/data/store";

export default async function MediaPage() {
  const assets = await listMediaAssets();

  return (
    <div className="space-y-6">
      <h1 className="text-display text-5xl">Media library</h1>
      <form
        action="/api/admin/upload"
        method="post"
        encType="multipart/form-data"
        className="rounded-[1.75rem] border border-dashed border-white/20 bg-[#111213] p-8"
      >
        <p className="text-sm leading-7 text-white/62">
          Upload images, videos, PDFs and models in local mode. This route is structured to switch to Supabase Storage once credentials are configured.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            name="file"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.avif,.mp4,.webm,.pdf,.glb,.gltf"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
          />
          <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">Upload asset</button>
        </div>
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-4">
            <div className="relative mb-4 min-h-48 overflow-hidden rounded-[1.25rem] bg-black/20">
              {asset.type === "image" || asset.type === "brand" ? (
                <Image src={asset.publicUrl} alt={asset.altText || asset.originalFilename} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 40vw, 100vw" className="object-cover" />
              ) : (
                <div className="flex min-h-48 items-center justify-center text-sm text-white/45">{asset.mimeType}</div>
              )}
            </div>
            <p className="truncate font-medium">{asset.originalFilename}</p>
            <p className="text-sm text-white/52">{asset.publicUrl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

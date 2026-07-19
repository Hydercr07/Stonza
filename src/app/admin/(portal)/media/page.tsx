import Image from "next/image";
import { deleteMediaAssetAction, updateMediaAssetAction } from "@/actions/admin";
import { AdminMediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/shared/ui/button";
import { listMediaAssets } from "@/lib/data/store";

export default async function MediaPage() {
  const assets = await listMediaAssets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-5xl">Media library</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
          Upload assets once, reuse them across products, categories, hero modes and global brand settings.
        </p>
      </div>
      <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <AdminMediaUploader
          name="libraryAssets"
          label="Upload library assets"
          description="Drag and drop or browse to upload images, videos, PDFs and models through the protected admin upload route."
          initialItems={[]}
          imageOnly={false}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-[1.5rem] border border-white/10 bg-[#111213] p-4">
            <div className="relative mb-4 min-h-48 overflow-hidden rounded-[1.25rem] bg-black/20">
              {/\.(png|jpe?g|webp|avif|svg)$/i.test(asset.publicUrl) ? (
                <Image
                  src={asset.publicUrl}
                  alt={asset.altText || asset.originalFilename}
                  fill
                  loading="eager"
                  sizes="(min-width: 1280px) 22vw, (min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex min-h-48 items-center justify-center text-sm text-white/45">{asset.mimeType}</div>
              )}
            </div>
            <p className="truncate font-medium">{asset.originalFilename}</p>
            <p className="text-xs text-white/42">{asset.publicUrl}</p>
            <form action={updateMediaAssetAction} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={asset.id} />
              <input
                name="altText"
                defaultValue={asset.altText}
                placeholder="Alt text"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              />
              <input
                name="caption"
                defaultValue={asset.caption}
                placeholder="Caption"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              />
              <div className="flex gap-3">
                <Button className="flex-1">Save</Button>
                <button
                  formAction={deleteMediaAssetAction}
                  className="rounded-full border border-white/12 px-4 py-3 text-sm text-white/70"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

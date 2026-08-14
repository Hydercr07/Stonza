"use client";

import Image from "next/image";
import { useState } from "react";
import { isRemoteAsset } from "@/lib/utils";

export function ProductGallery({
  images,
  altText,
}: {
  images: string[];
  altText: string;
}) {
  const gallery = images.length ? images : ["/brand/stonza-logo.png"];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative min-h-[24rem] overflow-hidden rounded-[2.1rem] border border-[#e1d4c0] bg-[#efe8dc] shadow-[0_18px_44px_rgba(26,20,12,0.06)] sm:min-h-[34rem]"
          aria-label="Open product image"
        >
          <Image
            src={activeImage}
            alt={altText}
            fill
            priority
            loading="eager"
            className="object-cover"
            sizes="(max-width: 768px) 92vw, (max-width: 1280px) 56vw, 720px"
            unoptimized={isRemoteAsset(activeImage)}
          />
        </button>
        {gallery.length > 1 ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {gallery.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`relative min-h-24 overflow-hidden rounded-[1.2rem] border ${activeImage === image ? "border-[#171717]" : "border-black/8"} bg-[#efe8dc]`}
              >
                <Image
                  src={image}
                  alt={altText}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={isRemoteAsset(image)}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,10,8,0.86)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white"
            onClick={() => setLightboxOpen(false)}
          >
            Close
          </button>
          <div className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#181411]">
            <Image
              src={activeImage}
              alt={altText}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={isRemoteAsset(activeImage)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

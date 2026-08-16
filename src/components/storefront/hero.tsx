"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { HeroSettings } from "@/types/domain";
import { Logo } from "@/components/shared/logo";

export function Hero({ hero }: { hero: HeroSettings }) {
  const slides = useMemo(
    () => hero.carousel.slides.filter((slide) => slide.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [hero.carousel.slides],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[index];

  if (!activeSlide) {
    return (
      <section className="w-full bg-[#f6efe3]">
        <div className="relative aspect-[12/7] overflow-hidden bg-[linear-gradient(135deg,#fffaf2,#efe6d7)] sm:aspect-[16/8]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(213,199,169,0.45),transparent_42%)]" />
          <div className="relative flex h-full items-center justify-center">
            <Logo dark src="/brand/stonza-logo.png" alt="STONZA" className="w-[180px] sm:w-[220px]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#f6efe3]">
      <div className="relative aspect-[12/7] overflow-hidden bg-[#efe8dc] sm:aspect-[16/8]">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.desktopImage || hero.desktopBannerImage || "/brand/stonza-logo.png"}
              alt={slide.heading || "STONZA banner"}
              fill
              priority={slideIndex === 0}
              loading={slideIndex === 0 ? "eager" : "lazy"}
              className="hidden object-cover sm:block"
              sizes="(max-width: 640px) 0px, (max-width: 1024px) 92vw, 1200px"
            />
            <Image
              src={
                slide.mobileImage ||
                slide.desktopImage ||
                hero.mobileBannerImage ||
                hero.desktopBannerImage ||
                "/brand/stonza-logo.png"
              }
              alt={slide.heading || "STONZA banner"}
              fill
              priority={slideIndex === 0}
              loading={slideIndex === 0 ? "eager" : "lazy"}
              className="object-cover sm:hidden"
              sizes="92vw"
            />
          </div>
        ))}

        {slides.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-[rgba(14,14,14,0.52)] px-3 py-2 backdrop-blur-sm">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Show banner ${slideIndex + 1}`}
                className={`h-2.5 w-2.5 rounded-full ${slideIndex === index ? "bg-white" : "bg-white/38"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

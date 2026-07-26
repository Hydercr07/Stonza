"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import type { HeroSettings } from "@/types/domain";

const GemstoneScene = dynamic(
  () => import("@/components/three/gemstone-scene").then((module) => module.GemstoneScene),
  {
    ssr: false,
    loading: () => <div className="stone-panel h-[320px] rounded-[2rem] md:h-[520px]" />,
  },
);

function HeroCopy({
  eyebrow,
  heading,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}) {
  return (
    <div className="max-w-2xl rounded-[2rem] border border-[#e8dfd1] bg-[rgba(255,252,247,0.96)] p-8 shadow-[0_24px_60px_rgba(22,18,14,0.1)] md:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-[#a2845d]">{eyebrow}</p>
      <h1 className="text-display mt-4 text-5xl leading-[0.95] text-[#171717] sm:text-6xl md:text-7xl">{heading}</h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-black/62 md:text-lg">{body}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={primaryHref}>
            {primaryLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
      <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
        {[
          { label: "Certified", value: "Natural origin" },
          { label: "Shipping", value: "Protected global dispatch" },
          { label: "Support", value: "Concierge sourcing" },
        ].map((item) => (
          <div key={item.label} className="stone-chip rounded-[1.1rem] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">{item.label}</p>
            <p className="mt-2 text-sm text-black/72">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroVideo({
  hero,
}: {
  hero: HeroSettings;
}) {
  const source = hero.video.mobileVideo || hero.video.desktopVideo;
  return (
    <>
      {source ? (
        <video
          autoPlay={hero.video.autoplay && hero.video.muted}
          muted={hero.video.muted}
          loop={hero.video.loop}
          playsInline
          controls={hero.video.showControls}
          poster={hero.video.posterImage}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={source} />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,12,13,0.68),rgba(11,12,13,0.42)),radial-gradient(circle_at_top_left,rgba(183,154,114,0.18),transparent_32%)]" />
      <div className="container-shell relative grid min-h-[calc(100vh-7rem)] items-center py-18 md:py-20">
        <HeroCopy
          eyebrow="Video story"
          heading={hero.video.heading}
          body={hero.video.description}
          primaryLabel={hero.video.primaryCtaLabel}
          primaryHref={hero.video.primaryCtaUrl}
          secondaryLabel={hero.video.secondaryCtaLabel}
          secondaryHref={hero.video.secondaryCtaUrl}
        />
      </div>
    </>
  );
}

function HeroCarousel({ hero }: { hero: HeroSettings }) {
  const slides = useMemo(
    () => hero.carousel.slides.filter((slide) => slide.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [hero.carousel.slides],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!hero.carousel.autoplay || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, hero.carousel.autoplayInterval);
    return () => window.clearInterval(timer);
  }, [hero.carousel.autoplay, hero.carousel.autoplayInterval, slides.length]);

  const slide = slides[index] ?? slides[0];

  if (!slide) {
    return <Hero hero={{ ...hero, activeMode: "interactive-3d" }} />;
  }

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(7,7,7,0.7),rgba(16,17,18,1)),url('${slide.desktopImage || hero.desktopBannerImage || "/placeholders/hero-strata.svg"}')`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,12,13,0.72),rgba(11,12,13,0.34)),radial-gradient(circle_at_top_left,rgba(183,154,114,0.18),transparent_32%)]" />
      <div className="container-shell relative grid min-h-[calc(100vh-7rem)] items-center gap-12 py-18 md:py-20">
        <HeroCopy
          eyebrow={slide.eyebrow}
          heading={slide.heading}
          body={slide.description}
          primaryLabel={slide.primaryCtaLabel}
          primaryHref={slide.primaryCtaUrl}
          secondaryLabel={slide.secondaryCtaLabel}
          secondaryHref={slide.secondaryCtaUrl}
        />
        {slides.length > 1 && hero.carousel.showArrows ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 text-white/72 transition hover:bg-white/10 hover:text-white"
              aria-label="Previous slide"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((current) => (current + 1) % slides.length)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 text-white/72 transition hover:bg-white/10 hover:text-white"
              aria-label="Next slide"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export function Hero({ hero }: { hero: HeroSettings }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-cover bg-center">
      {hero.activeMode === "carousel" ? <HeroCarousel hero={hero} /> : null}
      {hero.activeMode === "video" ? <HeroVideo hero={hero} /> : null}
      {hero.activeMode === "hybrid" ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg,rgba(7,7,7,0.7),rgba(16,17,18,1)),url('${hero.hybrid.desktopImage || hero.desktopBannerImage || "/placeholders/hero-strata.svg"}')`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,12,13,0.72),rgba(11,12,13,0.34)),radial-gradient(circle_at_top_left,rgba(183,154,114,0.18),transparent_32%)]" />
          <div className="container-shell relative grid min-h-[calc(100vh-7rem)] items-center gap-12 py-18 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            <HeroCopy
              eyebrow={hero.hybrid.eyebrow}
              heading={hero.hybrid.heading}
              body={hero.hybrid.description}
              primaryLabel={hero.hybrid.primaryCtaLabel}
              primaryHref={hero.hybrid.primaryCtaUrl}
              secondaryLabel={hero.hybrid.secondaryCtaLabel}
              secondaryHref={hero.hybrid.secondaryCtaUrl}
            />
            <GemstoneScene />
          </div>
        </>
      ) : null}
      {hero.activeMode === "interactive-3d" ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(7,7,7,0.7),rgba(16,17,18,1)),url('/placeholders/hero-strata.svg')",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,12,13,0.74),rgba(11,12,13,0.36)),radial-gradient(circle_at_top_left,rgba(183,154,114,0.18),transparent_32%)]" />
          <div className="container-shell relative grid min-h-[calc(100vh-7rem)] items-center gap-12 py-18 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            <div className="max-w-2xl rounded-[2rem] border border-[#e8dfd1] bg-[rgba(255,252,247,0.96)] p-8 shadow-[0_24px_60px_rgba(22,18,14,0.1)] md:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-[#a2845d]">{hero.interactive3d.eyebrow}</p>
              <h1 className="text-display mt-4 text-5xl leading-[0.95] text-[#171717] sm:text-6xl md:text-7xl">
                {hero.interactive3d.heading}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-black/68 md:text-lg">
                {hero.interactive3d.subheading}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={hero.interactive3d.primaryCtaUrl}>
                    {hero.interactive3d.primaryCtaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={hero.interactive3d.secondaryCtaUrl}>{hero.interactive3d.secondaryCtaLabel}</Link>
                </Button>
              </div>
            </div>
            <GemstoneScene />
          </div>
        </>
      ) : null}
    </section>
  );
}

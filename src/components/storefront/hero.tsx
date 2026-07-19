"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import type { HeroSettings } from "@/types/domain";

const GemstoneScene = dynamic(
  () => import("@/components/three/gemstone-scene").then((module) => module.GemstoneScene),
  {
    ssr: false,
    loading: () => <div className="stone-panel h-[320px] rounded-[2rem] md:h-[520px]" />,
  },
);

export function Hero({ hero }: { hero: HeroSettings }) {
  return (
    <section
      className="relative overflow-hidden border-b border-white/10 bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(180deg,rgba(7,7,7,0.7),rgba(16,17,18,1)),url('/placeholders/hero-strata.svg')",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(208,198,178,0.12),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="container-shell relative grid min-h-[calc(100vh-7rem)] items-center gap-12 py-18 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="max-w-2xl space-y-7">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">{hero.eyebrow}</p>
          <h1 className="text-display text-5xl leading-[0.92] text-white sm:text-6xl md:text-8xl">
            {hero.heading}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-white/74 md:text-xl">{hero.subheading}</p>
          <p className="max-w-xl text-sm leading-7 text-white/55 md:text-base">{hero.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={hero.primaryCtaUrl}>
                {hero.primaryCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={hero.secondaryCtaUrl}>{hero.secondaryCtaLabel}</Link>
            </Button>
          </div>
        </div>
        <GemstoneScene />
      </div>
    </section>
  );
}

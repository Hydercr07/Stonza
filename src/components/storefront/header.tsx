"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Header({
  logo,
  logoAlt,
  sticky,
}: {
  logo: string;
  logoAlt: string;
  sticky: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        `${sticky ? "sticky top-0" : "relative"} z-40`,
        scrolled
          ? "border-b border-[#d9cfbf] bg-[rgba(255,250,242,0.96)] shadow-[0_16px_36px_rgba(24,18,12,0.08)] backdrop-blur-xl"
          : "border-b border-[#e8dfd1] bg-[rgba(255,250,242,0.94)]",
      )}
    >
      <div className="container-shell flex min-h-18 items-center justify-center py-3 lg:min-h-24 lg:py-0">
        <Link href="/">
          <Logo dark href="" priority src={logo} alt={logoAlt} className="w-[126px] sm:w-[144px] lg:w-[172px] xl:w-[188px]" />
        </Link>
      </div>
    </header>
  );
}

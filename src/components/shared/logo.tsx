import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  light?: boolean;
  className?: string;
  priority?: boolean;
}

export function Logo({ href = "/", light = false, className, priority = false }: LogoProps) {
  const image = (
    <Image
      src="/brand/stonza-logo.png"
      alt="STONZA Original Stones"
      width={315}
      height={95}
      priority={priority}
      className={cn("h-auto w-[170px] md:w-[210px]", light && "brightness-0 invert", className)}
    />
  );

  return href ? <Link href={href}>{image}</Link> : image;
}

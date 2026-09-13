import Image from "next/image";
import Link from "next/link";
import { isRemoteAsset } from "@/lib/utils";
import type { HomepageBanner } from "@/types/domain";

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function BannerFrame({
  banner,
  children,
}: {
  banner: HomepageBanner;
  children: React.ReactNode;
}) {
  const className =
    "group block overflow-hidden rounded-[1.75rem] border border-[#e6dccd] bg-[#f7f1e7] shadow-[0_18px_44px_rgba(22,16,10,0.08)]";

  if (banner.linkUrl?.trim()) {
    if (isExternalUrl(banner.linkUrl)) {
      return (
        <a href={banner.linkUrl} className={className}>
          {children}
        </a>
      );
    }

    return (
      <Link href={banner.linkUrl} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}

export function HomepagePromotionalBanner({ banner }: { banner: HomepageBanner }) {
  return (
    <section className="container-shell py-4 lg:py-5">
      <BannerFrame banner={banner}>
        <div className="relative aspect-[1600/150] sm:aspect-[1600/240] lg:aspect-[1600/150]">
          <Image
            src={banner.imageUrl}
            alt={banner.altText}
            fill
            sizes="(min-width: 1440px) 1440px, (min-width: 1024px) calc(100vw - 4rem), 100vw"
            className="object-contain sm:object-cover transition duration-500 group-hover:scale-[1.015]"
            unoptimized={isRemoteAsset(banner.imageUrl)}
          />
        </div>
      </BannerFrame>
    </section>
  );
}
